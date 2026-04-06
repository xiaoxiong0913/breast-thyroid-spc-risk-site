# Figure Legends

## Figure 1
Cohort derivation flow for the month-level SEER analysis. The diagram summarizes the main SEER case-listing source, the independent MP-SIR latency supplement, patient-level linkage by Patient ID, derivation of the first malignant breast-cancer index cohort, exclusion of patients without a reliable 66-month non-event window, and calendar-based allocation to development and temporal-validation cohorts.

## Figure 2
Temporal discrimination across six machine-learning models and three benchmark comparators. Panel A shows temporal receiver operating characteristic curves for all models, with AUROC and 95% confidence intervals reported in the adjacent legend. Panel B shows temporal precision-recall curves for the same models using raw step functions. The dashed horizontal reference line marks the temporal event prevalence, which approximates the chance level for precision in this very-low-incidence setting. The precision axis is displayed from 0 to 0.006 to emphasize the clinically relevant low-prevalence range.

## Figure 3
Temporal calibration and decision-curve analysis for the selected deployment model. Panel A shows temporal calibration across the locked low-, intermediate-, and high-risk bands for the selected calibrated CatBoost model, with exact 95% binomial confidence intervals, cohort-share bars, and the ideal line. Panel B shows temporal decision-curve analysis for the same model with treat-all and treat-none strategies. The clinicopathologic baseline benchmark is retained in Table 3 and in eFigure 1-2 because its temporal calibration and net-benefit traces showed minimal visual separation in the main-panel range.

## Figure 4
Youden-anchored temporal risk-group presentation. Panel A shows mean predicted 5-year risk across low-, intermediate-, and high-risk groups defined by probability bands of <0.0022, 0.0022 to <0.0028, and >=0.0028. Panel B shows the corresponding observed 5-year event rates with event counts.

## Figure 5
SHAP summary of the selected deployment model. Panel A shows the global SHAP ranking by mean absolute SHAP value. Panel B shows a SHAP beeswarm summary, with each point representing a patient-level SHAP contribution for one aggregated feature.

## Figure 6
Public static manuscript showcase and deployment preview. The figure shows the web-facing translation surface used to present the locked manuscript figures, risk-group thresholds, and downloadable study materials. The public static URL is https://breast-thyroid-spc-risk-site.onrender.com.

# eFigure Legends

## eFigure 1
All-model temporal calibration. Panel A shows the six machine-learning models, and Panel B shows the three benchmark comparators together with the selected calibrated model. These supplementary panels retain the broader model context that was intentionally removed from the main manuscript to preserve figure clarity.

## eFigure 2
All-model temporal decision-curve analysis. Panel A shows the six machine-learning models, and Panel B shows the three benchmark comparators together with the selected calibrated model, the treat-all strategy, and the treat-none strategy.

## eFigure 3
Temporal precision-recall detail. Panel A preserves the full 0-1 precision scale, whereas Panel B zooms into the low-precision range that contains the dominant signal for this low-incidence endpoint.

## eFigure 4
R-based Pearson correlation heatmap of the retained clinicopathologic feature matrix used for post-screening collinearity review. The panel is intended to show correlation structure rather than to justify arbitrary pre-model feature removal.

## eFigure 5
LASSO coefficient path for the leading candidate predictors across the regularization range.

## eFigure 6
Cross-validated LASSO performance profile used to select the screening penalty parameter.

## eFigure 7
Threshold-family comparison in temporal validation, including the Youden, best-F1, high-sensitivity, high-specificity, and fixed 0.50 operating rules.

## eFigure 8
Web calculator preview retained as a translation aid rather than as a main-text efficacy figure.

## eFigure 9
Cumulative absolute risk of second primary thyroid cancer across the 5-year window after the 6-month landmark in the temporal-validation cohort.

## File list
- `Figure_1.tif`
- `Figure_2.tif`
- `Figure_3.tif`
- `Figure_4.tif`
- `Figure_5.tif`
- `Figure_6.tif`

## Supplementary file list
- `eFigure_4.tif`
- `eFigure_5.tif`
- `eFigure_6.tif`
- `eFigure_7.tif`
- `eFigure_8.tif`
- `eFigure_1.tif`
- `eFigure_2.tif`
- `eFigure_3.tif`
- `eFigure_9.tif`