import os
import json
import boto3
import hashlib
from dotenv import load_dotenv
from prefect import flow, task
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rag_core.loaders.sitemap_scraper import scrape_docs_from_sitemap

load_dotenv()

S3_BUCKET = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)


@task(retries=2, retry_delay_seconds=10)
def fetch_from_sitemap(sitemap_url: str):
    return scrape_docs_from_sitemap(sitemap_url)


@task
def upload_docs_to_s3(docs, tenant_id: str, tech_name: str):
    upload_count = 0

    for doc in docs:
        source_url = doc.metadata.get("source", "unknown")
        url_hash = hashlib.md5(source_url.encode("utf-8")).hexdigest()
        object_key = f"raw/tenants/{tenant_id}/{tech_name}/{url_hash}.txt"
        content = f"Source: {source_url}\n\n{doc.page_content}"

        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=object_key,
            Body=content.encode("utf-8"),
            ContentType="text/plain",
        )
        upload_count += 1


@flow(name="Enterprise Sitemap Sync", log_prints=True)
def sync_docs_via_sitemap():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, "sources_registry.json"), "r") as f:
        registry = json.load(f)

    global_sources = registry["global_sources"]
    for tenant_id, config in registry["tenants"].items():
        for tech in config["subscribed_tech_stack"]:
            if tech in global_sources:
                sitemap_url = global_sources[tech]
                try:
                    docs = fetch_from_sitemap(sitemap_url)
                    upload_docs_to_s3(docs, tenant_id, tech)
                except Exception as e:
                    print(f"Error {tech}: {e}")


if __name__ == "__main__":
    sync_docs_via_sitemap()
