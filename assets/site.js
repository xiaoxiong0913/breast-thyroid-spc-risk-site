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
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializeForm()),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.detail || `Prediction failed with status ${response.status}.`);
    }
    updateResult(await response.json());
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
    renderForm();
    setFormValues(exampleInput);
  } catch (error) {
    showError(error.message || "Unable to initialize calculator.");
  }
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
