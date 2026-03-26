import { getWorkouts } from "./storage.js";
import { getExerciseDetails } from "./exercises.js";

const CLIMBING_TYPES = ["Bouldering", "Top Rope", "Lead"];

function isClimbingType(type) {
  return CLIMBING_TYPES.includes(type);
}

function formatDateHeading(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function groupWorkoutsByDate(workouts) {
  return workouts.reduce((groups, workout) => {
    const dateKey = workout.date || "Unknown Date";

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(workout);
    return groups;
  }, {});
}

function buildClimbingCard(workout) {
  const nameLabel =
    workout.type === "Bouldering" ? "Problem Name" : "Route Name";

  return `
    <div class="workout-card">
      <h3>${workout.type} - ${workout.grade || "No grade"}</h3>
      <p><strong>Gym:</strong> ${workout.gym || "-"}</p>
      <p><strong>${nameLabel}:</strong> ${workout.projectName || "-"}</p>
      <p><strong>Notes:</strong> ${workout.notes || "-"}</p>
    </div>
  `;
}

function buildTrainingCard(workout, index) {
  return `
    <div class="workout-card">
      <h3>${workout.type} - ${workout.exercise || "Exercise"}</h3>
      <p><strong>Sets:</strong> ${workout.sets ?? "-"}</p>
      <p><strong>Reps / Seconds:</strong> ${workout.reps ?? "-"}</p>
      <p><strong>Notes:</strong> ${workout.notes || "-"}</p>
      <button type="button" class="details-btn" data-index="${index}">
        Show Exercise Details
      </button>
      <div class="exercise-details" id="details-${index}"></div>
    </div>
  `;
}

function buildDaySection(date, entries, startIndex) {
  let runningIndex = startIndex;

  const cards = entries.map((workout) => {
    if (isClimbingType(workout.type)) {
      return buildClimbingCard(workout);
    }

    const card = buildTrainingCard(workout, runningIndex);
    runningIndex += 1;
    return card;
  }).join("");

  return {
    html: `
      <section class="history-day-group">
        <h2>${formatDateHeading(date)}</h2>
        <div class="history-day-list">
          ${cards}
        </div>
      </section>
    `,
    nextIndex: runningIndex
  };
}

export async function displayWorkoutHistory() {
  const container = document.querySelector("#historyList");
  if (!container) return;

  const workouts = getWorkouts();

  const visibleWorkouts = workouts.filter((workout) => {
    if (isClimbingType(workout.type)) {
      return workout.status === "completed";
    }

    return true;
  });

  if (visibleWorkouts.length === 0) {
    container.innerHTML = "<p>No completed climbs or training entries logged yet.</p>";
    return;
  }

  const sortedWorkouts = [...visibleWorkouts].sort(
    (a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`)
  );

  const grouped = groupWorkoutsByDate(sortedWorkouts);
  const orderedDates = Object.keys(grouped).sort(
    (a, b) => new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)
  );

  let detailIndex = 0;

  container.innerHTML = orderedDates
    .map((date) => {
      const section = buildDaySection(date, grouped[date], detailIndex);
      detailIndex = section.nextIndex;
      return section.html;
    })
    .join("");

  const trainingEntries = sortedWorkouts.filter(
    (workout) => !isClimbingType(workout.type)
  );

  const detailButtons = container.querySelectorAll(".details-btn");

  detailButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.index);
      const detailsContainer = document.querySelector(`#details-${index}`);
      const workout = trainingEntries[index];

      if (!detailsContainer || !workout) return;

      if (detailsContainer.dataset.loaded === "true") {
        detailsContainer.innerHTML = "";
        detailsContainer.dataset.loaded = "false";
        button.textContent = "Show Exercise Details";
        return;
      }

      detailsContainer.innerHTML = "<p>Loading exercise details...</p>";

      const details = await getExerciseDetails(workout.exercise, workout.type);

      if (!details) {
        detailsContainer.innerHTML = "<p>No exercise details found.</p>";
        detailsContainer.dataset.loaded = "false";
        return;
      }

      detailsContainer.innerHTML = `
        <div class="exercise-preview-card">
          <p><strong>Category:</strong> ${workout.type || "General training"}</p>
          <p><strong>Equipment:</strong> ${details.equipment || "N/A"}</p>
          <p><strong>Description:</strong> ${details.description || "No description available."}</p>
        </div>
      `;

      detailsContainer.dataset.loaded = "true";
      button.textContent = "Hide Exercise Details";
    });
  });
}