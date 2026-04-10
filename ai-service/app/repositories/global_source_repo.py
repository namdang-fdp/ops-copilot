from sqlalchemy.orm import Session
from app.entities.global_source import GlobalSource


# query orm to get data from database
class GlobalSourceRepository:
    def get_all(self, db: Session):
        return db.query(GlobalSource).order_by(GlobalSource.created_at.desc()).all()

    def create(
        self, db: Session, tech_name: str, source_url: str, user_id: str
    ) -> GlobalSource:
        new_source = GlobalSource(
            tech_name=tech_name,
            source_url=source_url,
            status="PENDING",
            created_by=user_id,
        )
        db.add(new_source)
        db.commit()
        db.refresh(new_source)
        return new_source

    def update_status(
        self, db: Session, source_id: str, status: str, doc_count: int = 0
    ):
        source = db.query(GlobalSource).filter(GlobalSource.id == source_id).first()
        if source:
            source.status = status
            if doc_count > 0:
                source.document_count = doc_count
            db.commit()
            db.refresh(source)
        return source
