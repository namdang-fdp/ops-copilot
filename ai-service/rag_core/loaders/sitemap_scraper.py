import re
from langchain_community.document_loaders import SitemapLoader


def clean_html_content(html_content: str) -> str:
    cleaned = re.sub(r"\n+", "\n", html_content)
    return cleaned.strip()


def scrape_docs_from_sitemap(sitemap_url: str):
    print(f"Đang thả nhện đi cào sitemap: {sitemap_url}")

    # Update: Chỉ lọc những keyword sau, tránh cào hết sitemap
    loader = SitemapLoader(
        web_path=sitemap_url,
        filter_urls=[
            r".*troubleshooting.*",
            r".*errors.*",
            r".*issues.*",
            r".*debug.*",
        ],
        header_template={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."},
    )

    # Tốc độ cào (Requests per second)
    loader.requests_per_second = 3

    print("Bắt đầu kéo hàng, pha ly cà phê ngồi đợi nhé...")
    docs = loader.load()

    print(f"Đã cào xong {len(docs)} bài viết xịn xò!")
    return docs
