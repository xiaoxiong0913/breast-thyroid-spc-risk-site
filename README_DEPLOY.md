# Render Deployment Notes

This repository now deploys a Python web service for the breast-to-thyroid SPC risk calculator.

Deployment target:

- Render Web Service
- Service name: `breast-thyroid-spc-risk-site`
- Public URL: `https://breast-thyroid-spc-risk-site.onrender.com`

Runtime contents:

- `app/main.py`: FastAPI application with `/api/schema`, `/api/predict`, and `/health`.
- `model/catboost_postcalibrated_bundle.joblib`: saved preprocessor, CatBoost model, and Platt calibrator.
- `model/metadata.json`: calculator feature schema, labels, observed ranges, and locked risk-group thresholds.
- `index.html` and `assets/`: browser interface and manuscript material links.

Prediction path:

1. The API receives the 12 retained clinicopathologic fields.
2. The saved preprocessor applies imputation, scaling, and one-hot encoding.
3. CatBoost raw margin is passed to the saved Platt calibrator.
4. The API returns calibrated 5-year risk, risk per 1000 women, and locked risk group.
