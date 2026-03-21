import { getWorkouts } from "./storage.js";
import { getExerciseDetails } from "./exerciseAPI.js";

export async function displayWorkoutHistory() {
  const container = document.querySelector("#historyList");
  if (!container) return;

  const workouts = getWorkouts();

  if (workouts.length === 0) {
    container.innerHTML = "<p>No workouts logged yet.</p>";
    return;
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  container.innerHTML = sortedWorkouts
    .map(
      (workout, index) => `
        <div class="workout-card">
          <h3>${workout.type} - ${workout.exercise}</h3>
          <p><strong>Date:</strong> ${workout.date}</p>
          <p><strong>Sets:</strong> ${workout.sets ?? "-"}</p>
          <p><strong>Reps / Seconds:</strong> ${workout.reps ?? "-"}</p>
          <p><strong>Notes:</strong> ${workout.notes || "-"}</p>
          <button type="button" class="details-btn" data-index="${index}">
            Show Exercise Details
          </button>
          <div class="exercise-details" id="details-${index}"></div>
        </div>
      `
    )
    .join("");

  const detailButtons = container.querySelectorAll(".details-btn");

  detailButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const index = button.dataset.index;
      const detailsContainer = document.querySelector(`#details-${index}`);
      const workout = sortedWorkouts[index];

      if (!detailsContainer || !workout) return;

      if (detailsContainer.dataset.loaded === "true") {
        detailsContainer.innerHTML = "";
        detailsContainer.dataset.loaded = "false";
        button.textContent = "Show Exercise Details";
        return;
      }

      detailsContainer.innerHTML = "<p>Loading exercise details...</p>";

      const details = await getExerciseDetails(workout.exercise);

      if (!details) {
        detailsContainer.innerHTML = "<p>No exercise details found.</p>";
        detailsContainer.dataset.loaded = "false";
        return;
      }

      detailsContainer.innerHTML = `
        <div class="exercise-preview-card">
          <p><strong>Target:</strong> ${details.target || "N/A"}</p>
          <p><strong>Equipment:</strong> ${details.equipment || "N/A"}</p>
          ${
            details.gifUrl
              ? `<img src="${details.gifUrl}" alt="${workout.exercise}" class="history-exercise-image">`
              : ""
          }
        </div>
      `;

      detailsContainer.dataset.loaded = "true";
      button.textContent = "Hide Exercise Details";
    });
  });
}