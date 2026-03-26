import { getWorkouts, updateWorkoutStatus, deleteWorkout } from "./storage.js";
import { getRandomQuote } from "./quotes.js";

const CLIMBING_TYPES = ["Bouldering", "Top Rope", "Lead"];

function isClimbingType(type) {
  return CLIMBING_TYPES.includes(type);
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

function displayWorkoutSummary() {
  const totalEl = document.querySelector("#totalSessions");
  const recentEl = document.querySelector("#recentWorkout");

  if (!totalEl || !recentEl) return;

  const workouts = getWorkouts();
  totalEl.textContent = workouts.length;

  if (workouts.length === 0) {
    recentEl.textContent = "No entries logged yet.";
    return;
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`)
  );

  recentEl.textContent = buildRecentEntryText(sortedWorkouts[0]);
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
      const entryId = button.dataset.id;
      updateWorkoutStatus(entryId, "completed");
      displayWorkoutSummary();
      displayCurrentProjects();
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const entryId = button.dataset.id;
      deleteWorkout(entryId);
      displayWorkoutSummary();
      displayCurrentProjects();
    });
  });
}

async function loadQuote() {
  const quoteTextEl = document.querySelector("#quoteText");
  const quoteAuthorEl = document.querySelector("#quoteAuthor");
  const quoteStatusEl = document.querySelector("#quoteStatus");
  const newQuoteBtn = document.querySelector("#newQuoteBtn");

  if (!quoteTextEl || !quoteAuthorEl || !quoteStatusEl || !newQuoteBtn) return;

  quoteStatusEl.textContent = "Loading quote...";
  newQuoteBtn.disabled = true;
  newQuoteBtn.textContent = "Loading...";

  try {
    const quote = await getRandomQuote();

    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `— ${quote.author}`;
    quoteStatusEl.textContent = "";
  } catch (error) {
    console.error("Quote loading error:", error);

    quoteTextEl.textContent = `"Keep showing up. Small progress still counts."`;
    quoteAuthorEl.textContent = "— Training Log";
    quoteStatusEl.textContent = "Could not load a live quote right now.";
  } finally {
    newQuoteBtn.disabled = false;
    newQuoteBtn.textContent = "New Quote";
  }
}

export async function displayDashboard() {
  displayWorkoutSummary();
  displayCurrentProjects();

  const newQuoteBtn = document.querySelector("#newQuoteBtn");

  if (newQuoteBtn && !newQuoteBtn.dataset.bound) {
    newQuoteBtn.addEventListener("click", loadQuote);
    newQuoteBtn.dataset.bound = "true";
  }

  await loadQuote();
}