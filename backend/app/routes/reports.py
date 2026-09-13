from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from datetime import datetime

from app.models.database import get_db
from app.services import report_service

router = APIRouter(prefix="/api/reports", tags=["reports"])

XLSX_MEDIA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
PDF_MEDIA = "application/pdf"
CSV_MEDIA = "text/csv"


def _download(content: bytes, media_type: str, filename: str) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/maintenance/{equipment_id}")
async def maintenance_report(
    equipment_id: str,
    format: str = Query("pdf", description="pdf or csv"),
    db=Depends(get_db),
):
    """Export a per-equipment maintenance report."""
    fmt = format.lower()
    stamp = datetime.utcnow().strftime("%Y%m%d")
    try:
        if fmt == "pdf":
            report = await report_service.build_equipment_report(equipment_id, db)
            content = report_service.render_maintenance_pdf(report)
            return _download(content, PDF_MEDIA, f"maintenance_{equipment_id}_{stamp}.pdf")
        if fmt == "csv":
            content = report_service.generate_maintenance_csv(equipment_id, db)
            return _download(content, CSV_MEDIA, f"maintenance_{equipment_id}_{stamp}.csv")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    raise HTTPException(status_code=400, detail="format must be 'pdf' or 'csv'")


@router.get("/equipment-status")
async def equipment_status_report(
    format: str = Query("xlsx", description="xlsx or csv"),
    db=Depends(get_db),
):
    """Export the latest saved predictions for the whole fleet."""
    fmt = format.lower()
    stamp = datetime.utcnow().strftime("%Y%m%d")
    if fmt == "xlsx":
        content = report_service.generate_equipment_status_xlsx(db)
        return _download(content, XLSX_MEDIA, f"equipment_status_{stamp}.xlsx")
    if fmt == "csv":
        content = report_service.generate_equipment_status_csv(db)
        return _download(content, CSV_MEDIA, f"equipment_status_{stamp}.csv")

    raise HTTPException(status_code=400, detail="format must be 'xlsx' or 'csv'")


@router.get("/predictions")
async def predictions_report(
    format: str = Query("xlsx", description="xlsx or csv"),
    db=Depends(get_db),
):
    """Export the prediction history."""
    fmt = format.lower()
    stamp = datetime.utcnow().strftime("%Y%m%d")
    if fmt == "xlsx":
        content = report_service.generate_predictions_xlsx(db)
        return _download(content, XLSX_MEDIA, f"predictions_{stamp}.xlsx")
    if fmt == "csv":
        content = report_service.generate_equipment_status_csv(db)
        return _download(content, CSV_MEDIA, f"predictions_{stamp}.csv")

    raise HTTPException(status_code=400, detail="format must be 'xlsx' or 'csv'")