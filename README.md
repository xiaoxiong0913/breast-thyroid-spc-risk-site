# Breast-to-thyroid SPC Risk Calculator

Public web interface for the SEER-based post-calibrated CatBoost runtime bundle.

## Endpoints

- `/`: calculator page.
- `/api/schema`: input feature schema.
- `/api/predict`: calibrated 5-year risk prediction.
- `/health`: model loading health check.

## Local Run

```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`.

## Public URL

https://breast-thyroid-spc-risk-site.onrender.com
