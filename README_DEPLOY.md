# Render Deployment Notes

This repository now deploys a risk calculator for the breast-to-thyroid SPC model.

Deployment target:

- Render Web Service
- Service name: `breast-thyroid-spc-risk-site`
- Public URL: `https://breast-thyroid-spc-risk-site.onrender.com`

If the existing Render service is still a Static Site, the original URL remains usable because the browser loads `assets/model-runtime.json` and runs the model client-side. Converting the service to a Python Web Service enables the API endpoints, but the static fallback is sufficient for the public calculator UI.

Runtime contents:

- `app/main.py`: FastAPI application with `/api/schema`, `/api/predict`, and `/health`.
- `model/catboost_postcalibrated_bundle.joblib`: saved preprocessor, CatBoost model, and Platt calibrator.
- `model/metadata.json`: calculator feature schema, labels, observed ranges, and locked risk-group thresholds.
- `assets/model-runtime.json`: static browser runtime with preprocessing parameters, CatBoost trees, and Platt calibration coefficients.
- `index.html` and `assets/`: browser interface and manuscript material links.

Prediction path:

1. The page receives the 12 retained clinicopathologic fields.
2. The runtime applies imputation, scaling, and one-hot encoding.
3. CatBoost raw margin is passed to the Platt calibrator.
4. The page returns calibrated 5-year risk, risk per 1000 women, and locked risk group.
