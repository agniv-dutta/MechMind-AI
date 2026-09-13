from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime
from collections import deque
import asyncio
import math
import random

from app.services.predictive_service import SYNTHETIC_EQUIPMENT, EQUIPMENT_LIMITS

# Stream simulation tuning
TICK_INTERVAL_SECONDS = 2.0
SIM_SPEED_FACTOR = 6.0  # accelerates degradation so trends are visible in a live demo

TELEMETRY_METRICS = ["vibration", "temperature", "pressure", "current", "noise_level"]


class SensorGateway:
    """Simulated real-time sensor gateway with threshold checks and alerts.

    State is initialized from the equipment's stored sensor history (baseline)
    and then progresses with a small random walk + slow physical drift so the
    live stream remains continuous and realistic.
    """

    def __init__(self):
        self._baselines: Dict[str, Dict[str, float]] = {}
        self._state: Dict[str, Dict[str, Any]] = {}
        self._rng = random.Random(20260913)

    # ── Helpers ────────────────────────────────────────────────────
    def _limits_for(self, equipment_id: str) -> Dict[str, Dict[str, float]]:
        eq_type = SYNTHETIC_EQUIPMENT.get(equipment_id, {}).get(
            "equipment_type", "centrifugal pump"
        )
        base = EQUIPMENT_LIMITS.get(eq_type, EQUIPMENT_LIMITS["centrifugal pump"])

        thresholds: Dict[str, Dict[str, float]] = {}
        profile = SYNTHETIC_EQUIPMENT.get(equipment_id)
        for metric in TELEMETRY_METRICS:
            if profile and metric in profile.get("limits", {}):
                lim = profile["limits"][metric]
                thresholds[metric] = {"limit": lim["base"], "critical": lim["critical"]}
            elif metric in base:
                thresholds[metric] = base[metric]
        return thresholds

    def _get_baseline(self, equipment_id: str, latest_reading) -> Dict[str, float]:
        if equipment_id not in self._baselines:
            baseline = {}
            for metric in TELEMETRY_METRICS:
                baseline[metric] = latest_reading.get(metric) if latest_reading else 0.0
            if latest_reading:
                baseline["operating_hours"] = latest_reading.get("operating_hours") or 0.0
                baseline["maintenance_age_days"] = latest_reading.get("maintenance_age_days")
            self._baselines[equipment_id] = baseline
        return self._baselines[equipment_id]

    def _init_state(self, equipment_id: str):
        if equipment_id not in self._state:
            self._state[equipment_id] = {
                "phase": self._rng.uniform(0, 2 * math.pi),
                "drift": 0.0,
                "history": deque(maxlen=5),
                "tick": 0,
            }

    # ── Simulation core ────────────────────────────────────────────
    def _next_readings(self, equipment_id: str) -> Dict[str, float]:
        baseline = self._baselines[equipment_id]
        state = self._state[equipment_id]
        state["tick"] += 1
        state["phase"] += 0.35

        readings: Dict[str, float] = {}
        for metric in TELEMETRY_METRICS:
            limits = self._limits_for(equipment_id).get(metric)
            span = (
                limits["critical"] - limits["limit"]
                if limits and limits["critical"] > limits["limit"]
                else 1.0
            )
            base = baseline.get(metric, 0.0)

            sinusoidal = math.sin(state["phase"] + {"vibration": 0, "temperature": 1.2, "pressure": 2.0, "current": 0.6, "noise_level": 1.8}.get(metric, 0.0))
            jitter = self._rng.uniform(-0.08, 0.08) * span
            drift_step = (self._rng.uniform(-0.0008, 0.0020) * SIM_SPEED_FACTOR) * span

            # Compressor is already at the failure edge - hold the oscillator so
            # the degraded trend stays visible rather than randomly reverting.
            pressure_effect = 0.0
            if metric in ("vibration", "temperature", "current", "noise_level"):
                pressure_effect = min(max((baseline.get("pressure", 0) - 1000) / 3000, 0.0), 0.05)

            value = (
                base
                + pressure_effect * span
                + 0.25 * sinusoidal * span * 0.6
                + jitter
                + drift_step
            )
            state["drift"] += drift_step * 0.5
            readings[metric] = round(max(value, 0.0), 3)

        state["operating_hours"] = (
            baseline.get("operating_hours", 0) + state["tick"] * 0.02
        )
        state["history"].append(readings)
        return readings

    def _analyze(
        self,
        equipment_id: str,
        readings: Dict[str, float],
    ) -> Dict[str, Any]:
        state = self._state.get(equipment_id, {})
        history = list(state.get("history", []))

        vibration_trend = "stable"
        if len(history) >= 3:
            series = [h.get("vibration", 0) for h in history]
            slope = series[-1] - series[0]
            if slope > 0.03:
                vibration_trend = "rising"
            elif slope < -0.03:
                vibration_trend = "falling"

        anomalous_metrics: List[str] = []
        baseline = self._baselines.get(equipment_id, {})
        for metric in TELEMETRY_METRICS:
            limits = self._limits_for(equipment_id).get(metric)
            if not limits:
                continue
            span = limits["critical"] - limits["limit"]
            if span <= 0:
                continue
            deviation = abs(readings.get(metric, 0) - baseline.get(metric, 0))
            if deviation > 0.5 * span:
                anomalous_metrics.append(metric)

        return {
            "vibration_trend": vibration_trend,
            "anomalies": anomalous_metrics,
        }

    def _check_alerts(
        self,
        equipment_id: str,
        readings: Dict[str, float],
    ) -> List[Dict[str, Any]]:
        alerts: List[Dict[str, Any]] = []
        thresholds = self._limits_for(equipment_id)
        for metric, value in readings.items():
            cfg = thresholds.get(metric)
            if not cfg:
                continue
            limit = cfg["limit"]
            critical = cfg["critical"]
            warn_at = limit + 0.85 * (critical - limit) if critical > limit else critical
            if value >= critical:
                severity = "CRITICAL"
            elif value >= warn_at:
                severity = "WARNING"
            else:
                continue
            alerts.append({
                "sensor": metric,
                "value": round(value, 3),
                "threshold": critical,
                "severity": severity,
            })
        return alerts

    # ── Public API ─────────────────────────────────────────────────
    async def get_current_readings(
        self,
        equipment_id: str,
        latest_reading: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if latest_reading is None:
            raise ValueError(f"No telemetry baseline available for '{equipment_id}'")

        self._get_baseline(equipment_id, latest_reading)
        self._init_state(equipment_id)

        readings = self._next_readings(equipment_id)
        readings["operating_hours"] = round(self._state[equipment_id]["operating_hours"], 1)
        readings["maintenance_age_days"] = latest_reading.get("maintenance_age_days")

        analysis = self._analyze(equipment_id, readings)
        alerts = self._check_alerts(equipment_id, readings)

        return {
            "equipment_id": equipment_id,
            "equipment_name": SYNTHETIC_EQUIPMENT.get(equipment_id, {}).get("name"),
            "timestamp": datetime.utcnow().isoformat(),
            "readings": readings,
            "analysis": analysis,
            "alerts": alerts,
        }

    async def stream_sensor_data(
        self,
        equipment_id: str,
        latest_reading: Optional[Dict[str, Any]],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        baseline = self._get_baseline(equipment_id, latest_reading)
        self._init_state(equipment_id)

        while True:
            readings = self._next_readings(equipment_id)
            readings["operating_hours"] = round(self._state[equipment_id]["operating_hours"], 1)
            readings["maintenance_age_days"] = (
                latest_reading.get("maintenance_age_days") if latest_reading else None
            )

            frame = {
                "equipment_id": equipment_id,
                "equipment_name": SYNTHETIC_EQUIPMENT.get(equipment_id, {}).get("name"),
                "timestamp": datetime.utcnow().isoformat(),
                "readings": readings,
                "analysis": self._analyze(equipment_id, readings),
                "alerts": self._check_alerts(equipment_id, readings),
            }
            yield frame
            await asyncio.sleep(TICK_INTERVAL_SECONDS)


def get_baseline_from_reading(row) -> Optional[Dict[str, Any]]:
    """Serialize a SensorReading ORM row into the baseline dict the gateway needs."""
    if row is None:
        return None
    return {
        "vibration": row.vibration,
        "temperature": row.temperature,
        "pressure": row.pressure,
        "current": row.current,
        "noise_level": row.noise_level,
        "operating_hours": row.operating_hours,
        "maintenance_age_days": row.maintenance_age_days,
    }