const form = document.querySelector("#riskForm");
const predictButton = document.querySelector("#predictButton");
const resetButton = document.querySelector("#resetButton");
const loadExampleButton = document.querySelector("#loadExample");
const resultPanel = document.querySelector("#resultPanel");
const errorPanel = document.querySelector("#errorPanel");
const riskPercent = document.querySelector("#riskPercent");
const riskPer1000 = document.querySelector("#riskPer1000");
const riskGroup = document.querySelector("#riskGroup");
const riskDefinition = document.querySelector("#riskDefinition");
const endpointText = document.querySelector("#endpointText");

let schema = null;
let runtime = null;
let predictionMode = "api";

const exampleInput = {
  age: 63,
  combined_summary_stage: "Localized only",
  ajcc_stage_group: "I",
  race_ethnicity: "Non-Hispanic White",
  laterality: "Left - origin of primary",
  chemotherapy_recode: "No/Unknown",
  marital_status: "Married (including common law)",
  surgery_primary_site: 22,
  her2_status: "Negative",
  grade: "Moderately differentiated; Grade II",
  regional_nodes_examined: 3,
  radiation_recode: "Beam radiation",
};

function showError(message) {
  errorPanel.textContent = message;
  errorPanel.hidden = false;
}

function clearError() {
  errorPanel.hidden = true;
  errorPanel.textContent = "";
}

function fieldId(feature) {
  return `field-${feature}`;
}

function makeNumericField(feature, meta) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const label = document.createElement("label");
  label.htmlFor = fieldId(feature);
  label.textContent = schema.labels[feature] || feature;
  const input = document.createElement("input");
  input.id = fieldId(feature);
  input.name = feature;
  input.type = "number";
  input.step = "1";
  input.min = Math.floor(meta.min);
  input.max = Math.ceil(meta.max);
  input.placeholder = `Median ${meta.median}`;
  input.value = meta.default ?? "";
  wrap.append(label, input);
  const note = document.createElement("p");
  note.className = "field-note";
  note.textContent = schema.notes[feature] || `Observed range ${meta.min} to ${meta.max}.`;
  wrap.append(note);
  return wrap;
}

function makeSelectField(feature, options) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const label = document.createElement("label");
  label.htmlFor = fieldId(feature);
  label.textContent = schema.labels[feature] || feature;
  const select = document.createElement("select");
  select.id = fieldId(feature);
  select.name = feature;
  for (const optionValue of options) {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    select.append(option);
  }
  wrap.append(label, select);
  if (schema.notes[feature]) {
    const note = document.createElement("p");
    note.className = "field-note";
    note.textContent = schema.notes[feature];
    wrap.append(note);
  }
  return wrap;
}

function renderForm() {
  form.innerHTML = "";
  for (const feature of schema.features) {
    if (schema.numeric_ranges[feature]) {
      form.append(makeNumericField(feature, schema.numeric_ranges[feature]));
    } else {
      form.append(makeSelectField(feature, schema.categorical_options[feature] || []));
    }
  }
}

function setFormValues(values) {
  for (const [key, value] of Object.entries(values)) {
    const field = form.elements[key];
    if (field) field.value = value;
  }
}

function serializeForm() {
  const data = {};
  for (const feature of schema.features) {
    const field = form.elements[feature];
    if (!field) continue;
    if (schema.numeric_ranges[feature]) {
      data[feature] = field.value === "" ? null : Number(field.value);
    } else {
      data[feature] = field.value;
    }
  }
  return data;
}

function isMissing(value) {
  return value === null || value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value));
}

function sigmoid(value) {
  if (value >= 0) {
    const z = Math.exp(-value);
    return 1 / (1 + z);
  }
  const z = Math.exp(value);
  return z / (1 + z);
}

function riskGroupFor(probability) {
  const thresholds = schema.thresholds;
  if (probability < Number(thresholds.low_upper)) {
    return {
      group: "Low",
      label: "Low risk",
      definition: schema.risk_group_definitions.low,
    };
  }
  if (probability < Number(thresholds.high_lower)) {
    return {
      group: "Intermediate",
      label: "Intermediate risk",
      definition: schema.risk_group_definitions.intermediate,
    };
  }
  return {
    group: "High",
    label: "High risk",
    definition: schema.risk_group_definitions.high,
  };
}

function transformForRuntime(values) {
  const transformed = [];
  const prep = runtime.preprocessor;

  prep.numeric_features.forEach((feature, index) => {
    let value = values[feature];
    if (isMissing(value)) value = prep.numeric_impute[index];
    const numericValue = Number(value);
    transformed.push((numericValue - prep.numeric_mean[index]) / prep.numeric_scale[index]);
  });

  prep.categorical_features.forEach((feature, index) => {
    let value = values[feature];
    if (isMissing(value)) value = prep.categorical_impute[index];
    const textValue = String(value);
    for (const category of prep.categorical_categories[index]) {
      transformed.push(textValue === category ? 1 : 0);
    }
  });

  return transformed;
}

function evaluateCatBoost(transformed) {
  const model = runtime.catboost;
  let total = 0;

  for (const tree of model.oblivious_trees) {
    let leafIndex = 0;
    tree.splits.forEach((split, depth) => {
      const featureValue = transformed[split.float_feature_index] ?? 0;
      if (featureValue > split.border) {
        leafIndex |= (1 << depth);
      }
    });
    total += tree.leaf_values[leafIndex];
  }

  const scale = model.scale_and_bias[0];
  const bias = model.scale_and_bias[1][0];
  return total * scale + bias;
}

function clientPredict(values) {
  const transformed = transformForRuntime(values);
  const rawMargin = evaluateCatBoost(transformed);
  const calibratedProbability = sigmoid(runtime.calibrator.coef * rawMargin + runtime.calibrator.intercept);
  const probabilityPercent = calibratedProbability * 100;
  const group = riskGroupFor(calibratedProbability);

  return {
    risk_probability: calibratedProbability,
    risk_percent: probabilityPercent,
    risk_percent_display: `${probabilityPercent.toFixed(3)}%`,
    risk_per_1000: calibratedProbability * 1000,
    risk_per_1000_display: `${(calibratedProbability * 1000).toFixed(2)} per 1000 women`,
    risk_group: group,
    thresholds: schema.thresholds,
    model_name: schema.model_name,
    endpoint: schema.endpoint,
    inputs_used: values,
  };
}

function updateResult(result) {
  resultPanel.hidden = false;
  riskPercent.textContent = result.risk_percent_display;
  riskPer1000.textContent = result.risk_per_1000_display;
  riskGroup.textContent = result.risk_group.label;
  riskDefinition.textContent = result.risk_group.definition;
  endpointText.textContent = result.endpoint;

  for (const card of resultPanel.querySelectorAll(".result-card")) {
    card.classList.remove("low", "intermediate", "high");
  }
  const groupClass = result.risk_group.group.toLowerCase();
  for (const card of resultPanel.querySelectorAll(".result-card")) {
    card.classList.add(groupClass);
  }
}

async function submitPrediction(event) {
  event.preventDefault();
  clearError();
  predictButton.disabled = true;
  predictButton.textContent = "Calculating...";
  try {
    const values = serializeForm();
    if (predictionMode === "browser") {
      updateResult(clientPredict(values));
    } else {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || `Prediction failed with status ${response.status}.`);
      }
      updateResult(await response.json());
    }
  } catch (error) {
    showError(error.message || "Prediction failed.");
  } finally {
    predictButton.disabled = false;
    predictButton.textContent = "Calculate risk";
  }
}

async function boot() {
  try {
    const response = await fetch("/api/schema");
    if (!response.ok) throw new Error("Unable to load model schema.");
    schema = await response.json();
  } catch (error) {
    try {
      const response = await fetch("/assets/model-runtime.json");
      if (!response.ok) throw new Error("Unable to load browser model runtime.");
      runtime = await response.json();
      schema = runtime.schema;
      predictionMode = "browser";
    } catch (fallbackError) {
      showError(fallbackError.message || error.message || "Unable to initialize calculator.");
      return;
    }
  }
  renderForm();
  setFormValues(exampleInput);
}

form.addEventListener("submit", submitPrediction);
resetButton.addEventListener("click", () => {
  form.reset();
  resultPanel.hidden = true;
  clearError();
});
loadExampleButton.addEventListener("click", () => {
  setFormValues(exampleInput);
  resultPanel.hidden = true;
  clearError();
});

boot();
