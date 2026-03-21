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

  const workoutCards = await Promise.all(
    sortedWorkouts.map(async (workout) => {
      let details = null;

      if (workout.type === "Strength" || workout.type === "Conditioning") {
        details = await getExerciseDetails(workout.exercise);
      }

      return `
        <div class="workout-card">
          <h3>${workout.type} - ${workout.exercise}</h3>
          <p><strong>Date:</strong> ${workout.date}</p>
          ${
            details
              ? `
                <p><strong>Target:</strong> ${details.target || "N/A"}</p>
                <p><strong>Equipment:</strong> ${details.equipment || "N/A"}</p>
                ${
                  details.gifUrl
                    ? `<img src="${details.gifUrl}" alt="${workout.exercise}" class="history-exercise-image">`
                    : ""
                }
              `
              : ""
          }
          <p><strong>Sets:</strong> ${workout.sets ?? "-"}</p>
          <p><strong>Reps / Seconds:</strong> ${workout.reps ?? "-"}</p>
          <p><strong>Notes:</strong> ${workout.notes || "-"}</p>
        </div>
      `;
    })
  );

  container.innerHTML = workoutCards.join("");
}