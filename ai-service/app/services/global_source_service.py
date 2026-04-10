import os
import boto3
import uuid
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.repositories.global_source_repo import GlobalSourceRepository
from app.dtos.global_source_dto import GlobalSourceCreateReq

from app.worker.celery_worker import process_sitemap_task


class GlobalSourceService:
    def __init__(self):
        self.repo = GlobalSourceRepository()
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION"),
        )
        self.bucket_name = os.getenv("S3_BUCKET_NAME")

    def contribute_file(
        self, db: Session, file: UploadFile, tech_name: str, user_id: str
    ):
        # 1. Định danh file trên S3
        file_extension = file.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        s3_key = f"raw_uploads/{tech_name}/{unique_filename}"
        s3_uri = f"s3://{self.bucket_name}/{s3_key}"

        # 2. Stream đẩy thẳng lên S3 (FastAPI gánh)
        self.s3_client.upload_fileobj(
            file.file,
            self.bucket_name,
            s3_key,
            ExtraArgs={"ContentType": file.content_type},
        )

        # 3. Lưu DB PENDING
        new_source = self.repo.create(
            db=db,
            tech_name=tech_name,
            source_url=s3_uri,
            user_id=user_id,
            source_type="FILE",
        )

        return new_source

    def contribute_link(self, db: Session, req: GlobalSourceCreateReq, user_id: str):
        # 1. Ghi sổ nợ (DB)
        new_source = self.repo.create(
            db=db,
            tech_name=req.tech_name,
            source_url=req.source_url,
            user_id=user_id,
            source_type="SITEMAP",
        )

        # 2. Xé bill ném cho Celery đi cào (Treo Queue)
        process_sitemap_task.delay(
            source_id=str(new_source.id),
            tech_name=new_source.tech_name,
            sitemap_url=new_source.source_url,
        )

        return new_source

