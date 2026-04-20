from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "model" / "catboost_postcalibrated_bundle.joblib"
METADATA_PATH = ROOT / "model" / "metadata.json"


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="allow")


app = FastAPI(
    title="Breast-to-thyroid SPC risk model",
    version="1.0.0",
    description="Reader-facing risk calculator for the locked SEER-based CatBoost runtime bundle.",
)

app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")

_bundle: dict[str, Any] | None = None
_metadata: dict[str, Any] | None = None


def _load_bundle() -> dict[str, Any]:
    global _bundle
    if _bundle is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(f"Missing model bundle: {MODEL_PATH}")
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def _load_metadata() -> dict[str, Any]:
    global _metadata
    if _metadata is None:
        if not METADATA_PATH.exists():
            raise RuntimeError(f"Missing model metadata: {METADATA_PATH}")
        _metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    return _metadata


def _clean_value(value: Any) -> Any:
    if value is None:
        return np.nan
    if isinstance(value, str) and value.strip() == "":
        return np.nan
    return value


def _risk_group(probability: float) -> dict[str, str]:
    thresholds = _load_metadata()["thresholds"]
    if probability < float(thresholds["low_upper"]):
        return {
            "group": "Low",
            "label": "Low risk",
            "definition": _load_metadata()["risk_group_definitions"]["low"],
        }
    if probability < float(thresholds["high_lower"]):
        return {
            "group": "Intermediate",
            "label": "Intermediate risk",
            "definition": _load_metadata()["risk_group_definitions"]["intermediate"],
        }
    return {
        "group": "High",
        "label": "High risk",
        "definition": _load_metadata()["risk_group_definitions"]["high"],
    }


@app.get("/")
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.get("/health")
def health() -> dict[str, str]:
    _load_bundle()
    _load_metadata()
    return {"status": "ok", "model": "loaded"}


@app.get("/api/schema")
def schema() -> dict[str, Any]:
    return _load_metadata()


@app.post("/api/predict")
def predict(payload: PredictionRequest) -> dict[str, Any]:
    bundle = _load_bundle()
    metadata = _load_metadata()
    features = list(bundle["features"])
    raw_payload = payload.model_dump()

    row: dict[str, Any] = {}
    for feature in features:
        value = _clean_value(raw_payload.get(feature))
        if feature in metadata.get("numeric_ranges", {}):
            if value is np.nan or (isinstance(value, float) and math.isnan(value)):
                row[feature] = np.nan
            else:
                try:
                    row[feature] = float(value)
                except (TypeError, ValueError) as exc:
                    raise HTTPException(status_code=422, detail=f"{feature} must be numeric.") from exc
        else:
            row[feature] = value

    frame = pd.DataFrame([row], columns=features)
    transformed = bundle["preprocessor"].transform(frame)
    raw_margin = bundle["model"].predict(transformed, prediction_type="RawFormulaVal")
    probability = float(bundle["calibrator"].predict_proba(np.asarray(raw_margin).reshape(-1, 1))[0, 1])
    probability_percent = probability * 100.0

    group = _risk_group(probability)
    return {
        "risk_probability": probability,
        "risk_percent": probability_percent,
        "risk_percent_display": f"{probability_percent:.3f}%",
        "risk_per_1000": probability * 1000.0,
        "risk_per_1000_display": f"{probability * 1000.0:.2f} per 1000 women",
        "risk_group": group,
        "thresholds": metadata["thresholds"],
        "model_name": metadata["model_name"],
        "endpoint": metadata["endpoint"],
        "inputs_used": row,
    }
