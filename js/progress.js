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
  "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6",
  "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"
];

const ROPE_GRADES = [
  "5.6", "5.7", "5.8", "5.9",
  "5.10a", "5.10b", "5.10c", "5.10d",
  "5.11a", "5.11b", "5.11c", "5.11d",
  "5.12a", "5.12b", "5.12c", "5.12d",
  "5.13a", "5.13b", "5.13c", "5.13d",
  "5.14a", "5.14b", "5.14c", "5.14d",
  "5.15a", "5.15b", "5.15c", "5.15d"
];

function qs(selector) {
  return document.querySelector(selector);
}

function gradeIndex(grade, scale) {
  return scale.indexOf(grade);
}

function highestGrade(workouts, scale) {
  const valid = workouts
    .map((w) => w.grade)
    .filter((g) => scale.includes(g));

  if (!valid.length) return null;

  return valid.sort((a, b) => gradeIndex(b, scale) - gradeIndex(a, scale))[0];
}

function countByGrade(workouts, scale) {
  const counts = Object.fromEntries(scale.map((grade) => [grade, 0]));

  workouts.forEach((workout) => {
    if (counts[workout.grade] !== undefined) {
      counts[workout.grade] += 1;
    }
  });

  return counts;
}

function animateNumber(el, end) {
  if (!el) return;

  const duration = 600;
  const start = performance.now();

  function frame(time) {
    const progress = Math.min((time - start) / duration, 1);
    const value = Math.round(end * (1 - Math.pow(1 - progress, 3)));
    el.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function renderOverallCounts(workouts) {
  const container = qs("#overallCounts");
  if (!container) return;

  container.innerHTML = ENTRY_TYPES.map((type) => {
    const count = workouts.filter((workout) => workout.type === type).length;

    return `
      <div class="progress-stat-card">
        <p class="progress-stat-label">${type}</p>
        <p class="progress-stat-value" data-value="${count}">0</p>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-value]").forEach((el) => {
    animateNumber(el, Number(el.dataset.value));
  });
}

function renderClimbing(containerId, workouts, scale, label) {
  const container = qs(containerId);
  if (!container) return;

  const completed = workouts.filter((workout) => workout.status === "completed");
  const projects = workouts.filter((workout) => workout.status === "in_progress");

  const counts = countByGrade(completed, scale);
  const hardest = highestGrade(completed, scale);
  const visibleGrades = scale.filter((grade) => counts[grade] > 0 || projects.some((w) => w.grade === grade));
  const maxCount = Math.max(...visibleGrades.map((grade) => counts[grade] || 0), 1);

  container.innerHTML = `
    <div class="progress-climb-card">
      <div class="progress-climb-top">
        <div class="progress-stat-card">
          <p class="progress-stat-label">Completed</p>
          <p class="progress-stat-value" data-value="${completed.length}">0</p>
        </div>

        <div class="progress-stat-card">
          <p class="progress-stat-label">Hardest Send</p>
          <p class="progress-grade-highlight">${hardest || "-"}</p>
        </div>

        <div class="progress-stat-card">
          <p class="progress-stat-label">Current Projects</p>
          <p class="progress-stat-value" data-value="${projects.length}">0</p>
        </div>
      </div>

      <div class="grade-list">
        ${
          visibleGrades.length === 0
            ? `<p class="empty-text">No ${label.toLowerCase()} progress yet.</p>`
            : visibleGrades.map((grade) => {
                const count = counts[grade] || 0;
                const percent = count ? (count / maxCount) * 100 : 0;
                const projectCount = projects.filter((workout) => workout.grade === grade).length;

                return `
                  <div class="grade-row ${grade === hardest ? "highlight" : ""}">
                    <div class="grade-row-label">${grade}</div>
                    <div class="grade-bar">
                      <div class="grade-bar-fill" style="width:${percent}%"></div>
                    </div>
                    <div class="grade-row-count">${count}${projectCount ? ` / ${projectCount}p` : ""}</div>
                  </div>
                `;
              }).join("")
        }
      </div>
    </div>
  `;

  container.querySelectorAll("[data-value]").forEach((el) => {
    animateNumber(el, Number(el.dataset.value));
  });
}

function renderTraining(containerId, workouts, label) {
  const container = qs(containerId);
  if (!container) return;

  const total = workouts.length;

  const avg = (key) => {
    const values = workouts.map((workout) => Number(workout[key]) || 0).filter(Boolean);
    if (!values.length) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const max = (key) => workouts.reduce((highest, workout) => {
    return Math.max(highest, Number(workout[key]) || 0);
  }, 0);

  container.innerHTML = `
    <div class="progress-stat-card">
      <p class="progress-stat-label">${label} Entries</p>
      <p class="progress-stat-value" data-value="${total}">0</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Avg Sets</p>
      <p class="progress-stat-value">${avg("sets")}</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Avg Reps / Sec</p>
      <p class="progress-stat-value">${avg("reps")}</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Max Sets</p>
      <p class="progress-stat-value">${max("sets")}</p>
    </div>

    <div class="progress-stat-card">
      <p class="progress-stat-label">Max Reps</p>
      <p class="progress-stat-value">${max("reps")}</p>
    </div>
  `;

  container.querySelectorAll("[data-value]").forEach((el) => {
    animateNumber(el, Number(el.dataset.value));
  });
}

export function displayProgress() {
  const workouts = getWorkouts();

  renderOverallCounts(workouts);

  renderClimbing(
    "#boulderingProgress",
    workouts.filter((workout) => workout.type === "Bouldering"),
    BOULDER_GRADES,
    "Bouldering"
  );

  renderClimbing(
    "#topRopeProgress",
    workouts.filter((workout) => workout.type === "Top Rope"),
    ROPE_GRADES,
    "Top Rope"
  );

  renderClimbing(
    "#leadProgress",
    workouts.filter((workout) => workout.type === "Lead"),
    ROPE_GRADES,
    "Lead"
  );

  renderTraining(
    "#hangboardStats",
    workouts.filter((workout) => workout.type === "Hangboard"),
    "Hangboard"
  );

  renderTraining(
    "#strengthStats",
    workouts.filter((workout) => workout.type === "Strength"),
    "Strength"
  );

  renderTraining(
    "#conditioningStats",
    workouts.filter((workout) => workout.type === "Conditioning"),
    "Conditioning"
  );
}