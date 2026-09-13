from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosed
from typing import Optional
from datetime import datetime

from app.services.sensor_gateway import SensorGateway, get_baseline_from_reading
from app.models.database import get_db, SensorReading

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])
gateway = SensorGateway()


@router.websocket("/ws/{equipment_id}")
async def telegram_stream(
    websocket: WebSocket,
    equipment_id: str,
    db=Depends(get_db),
):
    """Stream live (simulated) sensor readings over WebSocket."""
    baselines = get_baseline_from_reading(
        db.query(SensorReading)
        .filter(SensorReading.equipment_id == equipment_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )
    if baselines is None:
        await websocket.close(code=4404, reason="No telemetry baseline for equipment")
        return

    await websocket.accept()
    try:
        async for frame in gateway.stream_sensor_data(equipment_id, baselines):
            await websocket.send_json(frame)
    except (WebSocketDisconnect, ConnectionClosed):
        # Browser refreshes and network drops can close a socket without a close
        # frame. Treat the resulting send failure as a normal disconnect.
        return


@router.get("/equipment")
async def list_telemetry_equipment(db=Depends(get_db)):
    """List equipment instances available for live telemetry."""
    tracked = db.query(
        SensorReading.equipment_id,
        SensorReading.equipment_name,
    ).distinct().all()

    return {
        "success": True,
        "data": [
            {
                "equipment_id": eq_id,
                "equipment_name": eq_name,
            }
            for eq_id, eq_name in tracked
        ],
    }


@router.get("/{equipment_id}/current")
async def current_readings(equipment_id: str, db=Depends(get_db)):
    """Return a snapshot of the latest live readings plus alerts."""
    latest = (
        db.query(SensorReading)
        .filter(SensorReading.equipment_id == equipment_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )
    baseline = get_baseline_from_reading(latest)
    if baseline is None:
        raise HTTPException(
            status_code=404,
            detail=f"No telemetry baseline available for '{equipment_id}'",
        )

    try:
        snapshot = await gateway.get_current_readings(equipment_id, baseline)
        return {"success": True, "data": snapshot}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
