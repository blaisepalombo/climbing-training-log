import { getWorkouts, updateWorkoutStatus, deleteWorkout } from "./storage.js";
import { getRandomQuote } from "./quotes.js";

const CLIMBING_TYPES = ["Bouldering", "Top Rope", "Lead"];
const TRAINING_TYPES = ["Hangboard", "Strength", "Conditioning"];

function isClimbingType(type) {
  return CLIMBING_TYPES.includes(type);
}

function isTrainingType(type) {
  return TRAINING_TYPES.includes(type);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function sortByDateDescending(workouts) {
  return [...workouts].sort(
    (a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`)
  );
}

function buildRecentEntryText(entry) {
  if (isClimbingType(entry.type)) {
    const grade = entry.grade || "No grade";
    const status = entry.status === "completed" ? "completed" : "in progress";
    const gym = entry.gym || "Unknown gym";
    return `${entry.date} - ${entry.type} - ${grade} - ${status} at ${gym}`;
  }

  const exercise = entry.exercise || "Exercise";
  return `${entry.date} - ${entry.type} - ${exercise}`;
}

function getMostCommonValue(items) {
  if (!items.length) return "No data yet";

  const counts = new Map();

  items.forEach((item) => {
    const normalizedItem = normalizeText(item);
    if (!normalizedItem) return;
    counts.set(normalizedItem, (counts.get(normalizedItem) || 0) + 1);
  });

  if (!counts.size) return "No data yet";

  let topValue = "";
  let topCount = 0;

  counts.forEach((count, value) => {
    if (count > topCount) {
      topValue = value;
      topCount = count;
    }
  });

  return topValue || "No data yet";
}

function getSessionsThisWeek(workouts) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return workouts.filter((workout) => {
    if (!workout.date) return false;
    const workoutDate = new Date(`${workout.date}T12:00:00`);
    return workoutDate >= start && workoutDate <= now;
  }).length;
}

function buildProjectCard(entry) {
  const label = entry.projectName?.trim() || `${entry.type} ${entry.grade || ""}`.trim();

  return `
    <div class="project-card" data-id="${entry.id}">
      <h4>${label}</h4>
      <p><strong>Type:</strong> ${entry.type}</p>
      <p><strong>Grade:</strong> ${entry.grade || "-"}</p>
      <p><strong>Gym:</strong> ${entry.gym || "-"}</p>
      <p><strong>Date Added:</strong> ${entry.date}</p>
      <div class="project-card-actions">
        <button type="button" class="complete-project-btn" data-id="${entry.id}">
          Mark Completed
        </button>
        <button type="button" class="delete-project-btn button-secondary" data-id="${entry.id}">
          Delete
        </button>
      </div>
    </div>
  `;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function displayWorkoutSummary() {
  const workouts = getWorkouts();
  const sortedWorkouts = sortByDateDescending(workouts);
  const climbingWorkouts = workouts.filter((entry) => isClimbingType(entry.type));
  const trainingWorkouts = workouts.filter((entry) => isTrainingType(entry.type));

  const activeProjects = climbingWorkouts.filter((entry) => entry.status === "in_progress");
  const completedProjects = climbingWorkouts.filter((entry) => entry.status === "completed");
  const totalProjects = activeProjects.length + completedProjects.length;

  const completionRate = totalProjects
    ? Math.round((completedProjects.length / totalProjects) * 100)
    : 0;

  setText("#totalSessions", String(workouts.length));
  setText("#sessionsThisWeek", String(getSessionsThisWeek(workouts)));
  setText(
    "#recentWorkout",
    sortedWorkouts.length ? buildRecentEntryText(sortedWorkouts[0]) : "No entries logged yet."
  );

  setText("#mostClimbedType", getMostCommonValue(climbingWorkouts.map((entry) => entry.type)));
  setText("#mostClimbedGrade", getMostCommonValue(climbingWorkouts.map((entry) => entry.grade)));
  setText("#mostVisitedGym", getMostCommonValue(climbingWorkouts.map((entry) => entry.gym)));

  setText("#activeProjectsCount", String(activeProjects.length));
  setText("#completedProjectsCount", String(completedProjects.length));
  setText("#projectCompletionRate", `${completionRate}%`);

  setText("#totalTrainingSessions", String(trainingWorkouts.length));
  setText("#mostLoggedExercise", getMostCommonValue(trainingWorkouts.map((entry) => entry.exercise)));
  setText("#mostLoggedTrainingType", getMostCommonValue(trainingWorkouts.map((entry) => entry.type)));
}

function displayCurrentProjects() {
  const projectsEl = document.querySelector("#currentProjects");
  if (!projectsEl) return;

  const workouts = getWorkouts();

  const projects = workouts
    .filter((entry) => isClimbingType(entry.type) && entry.status === "in_progress")
    .sort((a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`));

  if (!projects.length) {
    projectsEl.innerHTML = "<p>No current projects right now.</p>";
    return;
  }

  projectsEl.innerHTML = projects.map(buildProjectCard).join("");

  const completeButtons = projectsEl.querySelectorAll(".complete-project-btn");
  const deleteButtons = projectsEl.querySelectorAll(".delete-project-btn");

  completeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateWorkoutStatus(button.dataset.id, "completed");
      displayWorkoutSummary();
      displayCurrentProjects();
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      deleteWorkout(button.dataset.id);
      displayWorkoutSummary();
      displayCurrentProjects();
    });
  });
}

async function loadQuote() {
  const quoteTextEl = document.querySelector("#quoteText");
  const quoteAuthorEl = document.querySelector("#quoteAuthor");

  if (!quoteTextEl || !quoteAuthorEl) return;

  try {
    const quote = await getRandomQuote();
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `— ${quote.author}`;
  } catch (error) {
    console.error("Quote loading error:", error);
    quoteTextEl.textContent = `"Keep showing up. Small progress still counts."`;
    quoteAuthorEl.textContent = "— Training Log";
  }
}

export async function displayDashboard() {
  displayWorkoutSummary();
  displayCurrentProjects();
  await loadQuote();
}