# Breast-to-thyroid SPC Risk Calculator

Public web interface for the SEER-based post-calibrated CatBoost runtime bundle.

The page supports two runtime paths:

- Python Web Service mode uses `/api/schema` and `/api/predict`.
- Static fallback mode loads `/assets/model-runtime.json` and runs preprocessing, CatBoost tree traversal, and Platt calibration in the browser.

## Endpoints

- `/`: calculator page.
- `/api/schema`: input feature schema.
- `/api/predict`: calibrated 5-year risk prediction.
- `/health`: model loading health check.
- `/assets/model-runtime.json`: browser-side runtime used when the public Render service is still hosted as a static site.

## Local Run

```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`.

## Public URL

https://breast-thyroid-spc-risk-site.onrender.com
