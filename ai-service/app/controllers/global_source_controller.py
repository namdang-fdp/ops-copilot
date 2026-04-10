from fastapi import APIRouter, Depends, Header, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dtos.global_source_dto import GlobalSourceCreateReq, GlobalSourceRes
from app.services.global_source_service import GlobalSourceService
from typing import Optional

router = APIRouter(prefix="/global", tags=["Global Knowledge Base"])
service = GlobalSourceService()


# ==========================================
# CỔNG 1: NẠP FILE TRỰC TIẾP LÊN S3
# ==========================================
@router.post("/contribute/file", response_model=GlobalSourceRes, status_code=202)
def contribute_file(
    tech_name: str = Form(..., description="Tên công nghệ (vd: aws, kubernetes)"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(default="SYSTEM", alias="X-User-Id"),
):
    """API nạp file tài liệu vào S3 (hỗ trợ md, txt, pdf, xlsx, csv, mp4)"""
    allowed_extensions = ["pdf", "md", "txt", "xlsx", "csv", "mp4"]
    file_ext = file.filename.split(".")[-1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, detail=f"File type .{file_ext} is not supported yet."
        )

    return service.contribute_file(db, file, tech_name, x_user_id)


# ==========================================
# CỔNG 2: NẠP LINK SITEMAP (Giao cho Celery đi cào)
# ==========================================
@router.post("/contribute/link", response_model=GlobalSourceRes, status_code=202)
def contribute_link(
    req: GlobalSourceCreateReq,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(default="SYSTEM", alias="X-User-Id"),
):
    """API nạp sitemap link (Worker sẽ tự động cào và ném lên S3)"""
    return service.contribute_link(db, req, x_user_id)

