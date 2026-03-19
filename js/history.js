import { getWorkouts } from "./storage.js";

export function displayWorkoutHistory() {
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
      (workout) => `
        <div class="workout-card">
          <h3>${workout.type} - ${workout.exercise}</h3>
          <p><strong>Date:</strong> ${workout.date}</p>
          <p><strong>Sets:</strong> ${workout.sets ?? "-"}</p>
          <p><strong>Reps / Seconds:</strong> ${workout.reps ?? "-"}</p>
          <p><strong>Notes:</strong> ${workout.notes || "-"}</p>
        </div>
      `
    )
    .join("");
}