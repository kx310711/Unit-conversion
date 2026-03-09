const categorySelect = document.getElementById("category");
const fromUnitSelect = document.getElementById("from_unit");
const toUnitSelect = document.getElementById("to_unit");
const inputValue = document.getElementById("input_value");
const resultNode = document.getElementById("result");
const formulaNode = document.getElementById("formula");
const errorNode = document.getElementById("error");
const historyNode = document.getElementById("history");
const favoritesNode = document.getElementById("favorites");
const batchInput = document.getElementById("batch_input");
const batchOutput = document.getElementById("batch_output");
const themeToggle = document.getElementById("theme-toggle");
const categoryImage = document.getElementById("category_image");
const categoryCaption = document.getElementById("category_caption");
const calcDisplay = document.getElementById("calc_display");
const calcGrid = document.getElementById("calc_grid");

const HISTORY_KEY = "unit_conversion_history_v3";
const FAVORITES_KEY = "unit_conversion_favorites_v1";
const THEME_KEY = "unit_converter_theme_manual";

const CONVERSIONS = {
  temperature: {
    label: "Temperature",
    units: ["c", "f", "k"],
    names: { c: "Celsius", f: "Fahrenheit", k: "Kelvin" },
    image:
      "https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMDeveloperSkillsNetwork-CD0101EN-SkillsNetwork/labs/Theia%20Labs/02%20-%20HTML5%20Elements/images/thermo.png",
  },
  length: {
    label: "Length",
    units: ["m", "km", "mi", "ft", "in"],
    factors: { m: 1, km: 1000, mi: 1609.344, ft: 0.3048, in: 0.0254 },
    image:
      "https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMDeveloperSkillsNetwork-CD0101EN-SkillsNetwork/labs/Theia%20Labs/02%20-%20HTML5%20Elements/images/speedo.png",
  },
  weight: {
    label: "Weight",
    units: ["kg", "g", "lb", "oz"],
    factors: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 },
    image:
      "https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMDeveloperSkillsNetwork-CD0101EN-SkillsNetwork/labs/Theia%20Labs/02%20-%20HTML5%20Elements/images/weight.png",
  },
  speed: {
    label: "Speed",
    units: ["kmh", "mph", "ms"],
    factors: { kmh: 0.27777778, mph: 0.44704, ms: 1 },
    image: "https://cdn-icons-png.flaticon.com/512/2972/2972205.png",
  },
  area: {
    label: "Area",
    units: ["sqm", "sqkm", "sqft", "acre"],
    factors: { sqm: 1, sqkm: 1000000, sqft: 0.09290304, acre: 4046.8564224 },
    image: "https://cdn-icons-png.flaticon.com/512/2784/2784487.png",
  },
  volume: {
    label: "Volume",
    units: ["l", "ml", "gal", "cup"],
    factors: { l: 1, ml: 0.001, gal: 3.785411784, cup: 0.2365882365 },
    image: "https://cdn-icons-png.flaticon.com/512/3082/3082039.png",
  },
  time: {
    label: "Time",
    units: ["sec", "min", "hr", "day"],
    factors: { sec: 1, min: 60, hr: 3600, day: 86400 },
    image: "https://cdn-icons-png.flaticon.com/512/2088/2088617.png",
  },
  data: {
    label: "Data",
    units: ["b", "kb", "mb", "gb"],
    factors: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 },
    image: "https://cdn-icons-png.flaticon.com/512/2885/2885417.png",
  },
};

const UNIT_LABELS = {
  m: "Meters", km: "Kilometers", mi: "Miles", ft: "Feet", in: "Inches",
  kg: "Kilograms", g: "Grams", lb: "Pounds", oz: "Ounces",
  kmh: "km/h", mph: "mph", ms: "m/s",
  sqm: "Square meters", sqkm: "Square kilometers", sqft: "Square feet", acre: "Acres",
  l: "Liters", ml: "Milliliters", gal: "Gallons", cup: "Cups",
  sec: "Seconds", min: "Minutes", hr: "Hours", day: "Days",
  b: "Bytes", kb: "Kilobytes", mb: "Megabytes", gb: "Gigabytes",
  c: "Celsius", f: "Fahrenheit", k: "Kelvin",
};

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "Theme: Dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "Theme: Light";
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  setTheme(saved);

  themeToggle.addEventListener("click", function () {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
  });
}

function toBase(category, value, unit) {
  return value * CONVERSIONS[category].factors[unit];
}

function fromBase(category, value, unit) {
  return value / CONVERSIONS[category].factors[unit];
}

function convertTemperature(value, from, to) {
  if (from === to) return value;
  let celsius = value;
  if (from === "f") celsius = (value - 32) * (5 / 9);
  if (from === "k") celsius = value - 273.15;
  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

function convert(value, category, from, to) {
  if (category === "temperature") return convertTemperature(value, from, to);
  return fromBase(category, toBase(category, value, from), to);
}

function getFormulaText(category, from, to) {
  if (category === "temperature") {
    if (from === "c" && to === "f") return "(C × 9/5) + 32";
    if (from === "f" && to === "c") return "(F - 32) × 5/9";
    if (from === "c" && to === "k") return "C + 273.15";
    if (from === "k" && to === "c") return "K - 273.15";
    if (from === "f" && to === "k") return "(F - 32) × 5/9 + 273.15";
    if (from === "k" && to === "f") return "(K - 273.15) × 9/5 + 32";
  }

  const fromFactor = CONVERSIONS[category].factors[from];
  const toFactor = CONVERSIONS[category].factors[to];
  return `value × ${fromFactor / toFactor}`;
}

function updateCategoryImage() {
  const category = categorySelect.value;
  const cfg = CONVERSIONS[category];
  categoryImage.src = cfg.image;
  categoryCaption.textContent = `${cfg.label} conversion visual`;
}

function updateUnitOptions() {
  const category = categorySelect.value;
  const cfg = CONVERSIONS[category];
  const selectedFrom = fromUnitSelect.value;
  const selectedTo = toUnitSelect.value;

  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";

  cfg.units.forEach(function (unit) {
    const optFrom = document.createElement("option");
    optFrom.value = unit;
    optFrom.textContent = (cfg.names && cfg.names[unit]) || UNIT_LABELS[unit] || unit;
    fromUnitSelect.appendChild(optFrom);

    const optTo = document.createElement("option");
    optTo.value = unit;
    optTo.textContent = (cfg.names && cfg.names[unit]) || UNIT_LABELS[unit] || unit;
    toUnitSelect.appendChild(optTo);
  });

  fromUnitSelect.value = cfg.units.includes(selectedFrom) ? selectedFrom : cfg.units[0];
  toUnitSelect.value = cfg.units.includes(selectedTo) ? selectedTo : cfg.units[Math.min(1, cfg.units.length - 1)];

  updateCategoryImage();
}

function saveHistory(entry) {
  const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  const next = [entry, ...current].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  renderHistory(next);
}

function renderHistory(history) {
  if (!history.length) {
    historyNode.innerHTML = "<li>No recent conversions.</li>";
    return;
  }
  historyNode.innerHTML = history.map((item) => `<li>${item}</li>`).join("");
}

function saveFavorite(favorite) {
  const current = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  const exists = current.some((x) => x.category === favorite.category && x.from === favorite.from && x.to === favorite.to);
  const next = exists ? current : [favorite, ...current].slice(0, 10);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  renderFavorites(next);
}

function renderFavorites(favorites) {
  if (!favorites.length) {
    favoritesNode.innerHTML = "<li>No favorites yet.</li>";
    return;
  }

  favoritesNode.innerHTML = favorites
    .map(function (fav, i) {
      return `<li class="favorite-row"><button class="fav-btn" data-i="${i}">${CONVERSIONS[fav.category].label}: ${UNIT_LABELS[fav.from] || fav.from} → ${UNIT_LABELS[fav.to] || fav.to}</button><button class="remove-fav-btn" data-rm="${i}" title="Remove favorite">✕</button></li>`;
    })
    .join("");

  favoritesNode.querySelectorAll(".fav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const idx = Number(btn.getAttribute("data-i"));
      const selected = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")[idx];
      if (!selected) return;
      categorySelect.value = selected.category;
      updateUnitOptions();
      fromUnitSelect.value = selected.from;
      toUnitSelect.value = selected.to;
      runConversion(false);
    });
  });

  favoritesNode.querySelectorAll(".remove-fav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const idx = Number(btn.getAttribute("data-rm"));
      removeFavorite(idx);
    });
  });
}

function runConversion(save = false) {
  const value = Number(inputValue.value);
  const category = categorySelect.value;
  const from = fromUnitSelect.value;
  const to = toUnitSelect.value;

  if (!Number.isFinite(value)) {
    errorNode.textContent = "Please enter a valid number.";
    resultNode.textContent = "-";
    formulaNode.textContent = "-";
    return;
  }

  errorNode.textContent = "";

  const converted = Number(convert(value, category, from, to).toFixed(10));
  resultNode.textContent = `${value} ${UNIT_LABELS[from] || from} = ${converted} ${UNIT_LABELS[to] || to}`;
  formulaNode.textContent = getFormulaText(category, from, to);

  if (save) saveHistory(resultNode.textContent);
}

function swapUnits() {
  const temp = fromUnitSelect.value;
  fromUnitSelect.value = toUnitSelect.value;
  toUnitSelect.value = temp;
  runConversion(false);
}

function clearAll() {
  inputValue.value = "";
  batchInput.value = "";
  batchOutput.innerHTML = "";
  errorNode.textContent = "";
  resultNode.textContent = "-";
  formulaNode.textContent = "-";
}

function runBatch() {
  const raw = batchInput.value.trim();
  if (!raw) {
    batchOutput.innerHTML = "<li>Add values first.</li>";
    return;
  }

  const values = raw.split(/[\s,\n]+/).map(Number).filter(Number.isFinite);
  if (!values.length) {
    batchOutput.innerHTML = "<li>No valid numbers found.</li>";
    return;
  }

  const category = categorySelect.value;
  const from = fromUnitSelect.value;
  const to = toUnitSelect.value;

  batchOutput.innerHTML = values
    .map(function (value) {
      const converted = Number(convert(value, category, from, to).toFixed(10));
      return `<li>${value} ${UNIT_LABELS[from] || from} = ${converted} ${UNIT_LABELS[to] || to}</li>`;
    })
    .join("");
}

function addCurrentFavorite() {
  saveFavorite({
    category: categorySelect.value,
    from: fromUnitSelect.value,
    to: toUnitSelect.value,
  });
}

function removeFavorite(index) {
  const current = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  const next = current.filter(function (_, i) {
    return i !== index;
  });
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  renderFavorites(next);
}

function clearAllFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
  renderFavorites([]);
}

async function copyResultText() {
  if (!resultNode.textContent || resultNode.textContent === "-") {
    errorNode.textContent = "Convert first before copying result.";
    return;
  }

  try {
    await navigator.clipboard.writeText(resultNode.textContent);
    errorNode.textContent = "";
  } catch (error) {
    errorNode.textContent = "Could not copy result automatically.";
  }
}

async function copyFormulaText() {
  if (!formulaNode.textContent || formulaNode.textContent === "-") {
    errorNode.textContent = "No formula available to copy.";
    return;
  }

  try {
    await navigator.clipboard.writeText(formulaNode.textContent);
    errorNode.textContent = "";
  } catch (error) {
    errorNode.textContent = "Could not copy formula automatically.";
  }
}

function handleCalculatorKey(key) {
  if (key === "clear") {
    calcDisplay.value = "0";
    return;
  }

  if (key === "back") {
    calcDisplay.value = calcDisplay.value.length <= 1 ? "0" : calcDisplay.value.slice(0, -1);
    return;
  }

  if (key === "pow10") {
    calcDisplay.value += "*10**";
    return;
  }

  if (key === "equals") {
    try {
      const expression = calcDisplay.value.replace(/[^-+*/().0-9sqrt ]/g, "").replace(/sqrt\(/g, "Math.sqrt(");
      const result = Function(`"use strict"; return (${expression});`)();
      calcDisplay.value = Number.isFinite(result) ? String(result) : "Error";
    } catch {
      calcDisplay.value = "Error";
    }
    return;
  }

  calcDisplay.value = calcDisplay.value === "0" || calcDisplay.value === "Error" ? key : calcDisplay.value + key;
}

function initCalculator() {
  calcGrid.querySelectorAll("button").forEach(function (button) {
    button.addEventListener("click", function () {
      handleCalculatorKey(button.getAttribute("data-key"));
    });
  });
}

function initCategories() {
  Object.entries(CONVERSIONS).forEach(function ([key, cfg]) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = cfg.label;
    categorySelect.appendChild(option);
  });

  categorySelect.value = "temperature";
  updateUnitOptions();
}

function init() {
  initTheme();
  initCategories();
  initCalculator();

  renderHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
  renderFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));

  categorySelect.addEventListener("change", function () {
    updateUnitOptions();
    runConversion(false);
  });
  fromUnitSelect.addEventListener("change", function () { runConversion(false); });
  toUnitSelect.addEventListener("change", function () { runConversion(false); });
  inputValue.addEventListener("input", function () { runConversion(false); });

  document.getElementById("convert_btn").addEventListener("click", function () { runConversion(true); });
  document.getElementById("favorite_btn").addEventListener("click", addCurrentFavorite);
  document.getElementById("copy_result_btn").addEventListener("click", copyResultText);
  document.getElementById("copy_formula_btn").addEventListener("click", copyFormulaText);
  document.getElementById("swap_btn").addEventListener("click", swapUnits);
  document.getElementById("clear_btn").addEventListener("click", clearAll);
  document.getElementById("clear_favorites_btn").addEventListener("click", clearAllFavorites);
  document.getElementById("batch_btn").addEventListener("click", runBatch);

  inputValue.addEventListener("keydown", function (event) {
    if (event.key === "Enter") runConversion(true);
  });
}

init();
