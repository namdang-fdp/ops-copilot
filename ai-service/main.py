from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from app.config.database import engine, Base
from app.controllers import global_source_controller
import uvicorn

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ops Copilot - AI Service API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)


@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


app.include_router(global_source_controller.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "AI Service is running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
