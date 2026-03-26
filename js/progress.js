import { getWorkouts } from "./storage.js";

const ENTRY_TYPES = [
  "Bouldering",
  "Top Rope",
  "Lead",
  "Hangboard",
  "Strength",
  "Conditioning"
];

const BOULDER_GRADES = [
  "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"
];

const ROPE_GRADES = [
  "5.6", "5.7", "5.8", "5.9",
  "5.10a", "5.10b", "5.10c", "5.10d",
  "5.11a", "5.11b", "5.11c", "5.11d",
  "5.12a", "5.12b", "5.12c", "5.12d"
];

function qs(selector) {
  return document.querySelector(selector);
}

function isClimbingType(type) {
  return ["Bouldering", "Top Rope", "Lead"].includes(type);
}

function isTrainingType(type) {
  return ["Hangboard", "Strength", "Conditioning"].includes(type);
}

function getCompletedClimbsByType(workouts, type) {
  return workouts.filter(
    (workout) => workout.type === type && workout.status === "completed"
  );
}

function getTrainingEntriesByType(workouts, type) {
  return workouts.filter((workout) => workout.type === type);
}

function gradeIndex(grade, scale) {
  return scale.indexOf(grade);
}

function highestCompletedGrade(workouts, scale) {
  if (!workouts.length) return null;

  const valid = workouts
    .map((workout) => workout.grade)
    .filter((grade) => scale.includes(grade));

  if (!valid.length) return null;

  return valid.sort((a, b) => gradeIndex(b, scale) - gradeIndex(a, scale))[0];
}

function averageTrainingValue(workouts, key) {
  if (!workouts.length) return 0;

  const values = workouts
    .map((workout) => Number(workout[key]) || 0)
    .filter((value) => value > 0);

  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function maxTrainingValue(workouts, key) {
  if (!workouts.length) return 0;

  return workouts.reduce((max, workout) => {
    const value = Number(workout[key]) || 0;
    return value > max ? value : max;
  }, 0);
}

function totalTrainingVolume(workouts) {
  if (!workouts.length) return 0;

  return workouts.reduce((sum, workout) => {
    const sets = Number(workout.sets) || 0;
    const reps = Number(workout.reps) || 0;
    return sum + (sets * reps);
  }, 0);
}

function animateNumber(element, endValue, decimals = 0) {
  if (!element) return;

  const duration = 700;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = endValue * eased;

    element.textContent = decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function renderOverallCounts(workouts) {
  const container = qs("#overallCounts");
  if (!container) return;

  const counts = ENTRY_TYPES.map((type) => ({
    type,
    count: workouts.filter((workout) => workout.type === type).length
  }));

  container.innerHTML = counts
    .map(
      ({ type, count }) => `
        <div class="progress-stat-card">
          <p class="progress-stat-label">${type}</p>
          <p class="progress-stat-value" data-count-value="${count}">0</p>
        </div>
      `
    )
    .join("");

  container.querySelectorAll("[data-count-value]").forEach((el) => {
    animateNumber(el, Number(el.dataset.countValue));
  });
}

function renderClimbingSection(containerSelector, workouts, scale, label) {
  const container = qs(containerSelector);
  if (!container) return;

  const completed = workouts.filter((workout) => workout.status === "completed");
  const countsByGrade = Object.fromEntries(scale.map((grade) => [grade, 0]));

  completed.forEach((workout) => {
    if (countsByGrade[workout.grade] !== undefined) {
      countsByGrade[workout.grade] += 1;
    }
  });

  const highestGrade = highestCompletedGrade(completed, scale);
  const highestIndex = highestGrade ? gradeIndex(highestGrade, scale) : -1;
  const markerPercent =
    highestIndex >= 0 ? (highestIndex / (scale.length - 1)) * 100 : 0;

  container.innerHTML = `
    <div class="progress-climb-card">
      <div class="progress-climb-top">
        <div class="progress-stat-card">
          <p class="progress-stat-label">Completed ${label}</p>
          <p class="progress-stat-value" data-count-value="${completed.length}">0</p>
        </div>
        <div class="progress-stat-card">
          <p class="progress-stat-label">Hardest Completed</p>
          <p class="progress-grade-highlight">${highestGrade || "-"}</p>
        </div>
      </div>

      <div class="grade-progress-wrap">
        <div class="grade-progress-track"></div>
        ${
          highestIndex >= 0
            ? `<div class="grade-progress-marker" style="left:${markerPercent}%;">
                 <span>${highestGrade}</span>
               </div>`
            : ``
        }

        <div class="grade-dots-row">
          ${scale
            .map((grade) => {
              const count = countsByGrade[grade];
              const active = count > 0 ? "active" : "";
              const achieved =
                highestIndex >= 0 && gradeIndex(grade, scale) <= highestIndex
                  ? "achieved"
                  : "";

              return `
                <div class="grade-dot-item">
                  <div class="grade-dot-count">${count > 0 ? count : ""}</div>
                  <div class="grade-dot ${active} ${achieved}"></div>
                  <div class="grade-dot-label">${grade}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-count-value]").forEach((el) => {
    animateNumber(el, Number(el.dataset.countValue));
  });
}

function renderTrainingSection(containerSelector, workouts, label) {
  const container = qs(containerSelector);
  if (!container) return;

  const totalEntries = workouts.length;
  const avgSets = averageTrainingValue(workouts, "sets");
  const avgReps = averageTrainingValue(workouts, "reps");
  const maxSets = maxTrainingValue(workouts, "sets");
  const maxReps = maxTrainingValue(workouts, "reps");
  const volume = totalTrainingVolume(workouts);

  container.innerHTML = `
    <div class="progress-stat-card">
      <p class="progress-stat-label">${label} Entries</p>
      <p class="progress-stat-value" data-count-value="${totalEntries}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Average Sets</p>
      <p class="progress-stat-value" data-count-value="${avgSets.toFixed(1)}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Average Reps / Seconds</p>
      <p class="progress-stat-value" data-count-value="${avgReps.toFixed(1)}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Longest / Highest Sets</p>
      <p class="progress-stat-value" data-count-value="${maxSets}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Longest / Highest Reps / Seconds</p>
      <p class="progress-stat-value" data-count-value="${maxReps}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Total Volume</p>
      <p class="progress-stat-value" data-count-value="${volume}">0</p>
    </div>
  `;

  container.querySelectorAll("[data-count-value]").forEach((el) => {
    const raw = Number(el.dataset.countValue);
    const decimals = String(el.dataset.countValue).includes(".") ? 1 : 0;
    animateNumber(el, raw, decimals);
  });
}

export function displayProgress() {
  const page = qs("#overallCounts");
  if (!page) return;

  const workouts = getWorkouts();

  renderOverallCounts(workouts);

  renderClimbingSection(
    "#boulderingProgress",
    getCompletedClimbsByType(workouts, "Bouldering"),
    BOULDER_GRADES,
    "Boulders"
  );

  renderClimbingSection(
    "#topRopeProgress",
    getCompletedClimbsByType(workouts, "Top Rope"),
    ROPE_GRADES,
    "Routes"
  );

  renderClimbingSection(
    "#leadProgress",
    getCompletedClimbsByType(workouts, "Lead"),
    ROPE_GRADES,
    "Routes"
  );

  renderTrainingSection(
    "#hangboardStats",
    getTrainingEntriesByType(workouts, "Hangboard"),
    "Hangboard"
  );

  renderTrainingSection(
    "#strengthStats",
    getTrainingEntriesByType(workouts, "Strength"),
    "Strength"
  );

  renderTrainingSection(
    "#conditioningStats",
    getTrainingEntriesByType(workouts, "Conditioning"),
    "Conditioning"
  );
}