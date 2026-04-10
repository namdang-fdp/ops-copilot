# app/worker/celery_worker.py
import os
import boto3
import sys
from celery import Celery
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import hashlib
from rag_core.loaders.sitemap_scraper import scrape_docs_from_sitemap

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
from app.config.database import SessionLocal
from app.entities.global_source import GlobalSource

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
)

bucket_name = os.getenv("AWS_BUCKET_NAME", "seal-copilot-data")

load_dotenv()

broker_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

celery_app = Celery(
    "ops_copilot_worker",
    broker=broker_url,
    backend=broker_url,
)


@celery_app.task(name="process_sitemap_task")
def process_sitemap_task(source_id: str, tech_name: str, sitemap_url: str):
    db = SessionLocal()
    try:
        print(f"\n[WORKER] 🕷️ Nhận lệnh thả nhện cào: {sitemap_url}")
        source = db.query(GlobalSource).filter(GlobalSource.id == source_id).first()
        if source:
            source.status = "PROCESSING"
            db.commit()

        # 1. Gọi hàm cào Sitemap Langchain của ông
        docs = scrape_docs_from_sitemap(sitemap_url)
        doc_count = len(docs)

        # 2. Băm từng bài viết quăng thẳng lên S3
        for doc in docs:
            # Lấy URL gốc làm tên file để tránh trùng
            source_url = doc.metadata.get("source", "unknown")
            url_hash = hashlib.md5(source_url.encode("utf-8")).hexdigest()

            # Quăng vào chung ổ raw_uploads với tụi File luôn
            object_key = f"raw_uploads/{tech_name}/sitemap_{url_hash}.txt"

            # Gắn cái Link gốc lên đầu file để xíu nữa Chunking Worker đọc được
            content = f"Source URL: {source_url}\n\n{doc.page_content}"

            s3_client.put_object(
                Bucket=bucket_name,
                Key=object_key,
                Body=content.encode("utf-8"),
                ContentType="text/plain",
            )

        # 3. Báo cáo sếp xong việc
        if source:
            source.status = "ACTIVE"
            source.document_count = doc_count
            db.commit()

        print(f"[WORKER] ✅ Xong! Đã bơm {doc_count} bài viết của {tech_name} lên S3.")

    except Exception as e:
        print(f"[WORKER] ❌ Lỗi cào sitemap: {e}")
        db.rollback()
        if source:
            source.status = "FAILED"
            db.commit()
    finally:
        db.close()


@celery_app.task(name="pull_global_sitemap_task")
def pull_global_sitemap_task(source_id: str, tech_name: str, sitemap_url: str):
    db: Session = SessionLocal()
    try:
        print(f"\n[WORKER] 🐇 Đã nhận vé! Bắt đầu cào: {tech_name} từ {sitemap_url}")

        # 1. Báo cáo sếp là em đang làm (PROCESSING)
        source = db.query(GlobalSource).filter(GlobalSource.id == source_id).first()
        if source:
            source.status = "PROCESSING"
            db.commit()

        # 2. Xách súng đi cào
        docs = scrape_docs_from_sitemap(sitemap_url)
        doc_count = len(docs)

        # 3. TODO: Ném code boto3 upload S3 vào đây
        # ...

        # 4. Báo cáo sếp em làm xong (ACTIVE)
        if source:
            source.status = "ACTIVE"
            source.document_count = doc_count
            db.commit()

        print(f"[WORKER] ✅ Tuyệt vời! Cào được {doc_count} files cho {tech_name}.")

    except Exception as e:
        print(f"[WORKER] ❌ Toang mạng ở {tech_name}: {e}")
        db.rollback()
        source = db.query(GlobalSource).filter(GlobalSource.id == source_id).first()
        if source:
            source.status = "FAILED"
            db.commit()
    finally:
        db.close()
