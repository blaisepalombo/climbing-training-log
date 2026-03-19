import { getWorkouts } from "./storage.js";

export function displayProgress() {
  const totalEl = document.querySelector("#totalWorkouts");
  const commonEl = document.querySelector("#commonWorkout");

  if (!totalEl || !commonEl) return;

  const workouts = getWorkouts();

  totalEl.textContent = workouts.length;

  if (workouts.length === 0) {
    commonEl.textContent = "None yet";
    return;
  }

  const workoutCounts = {};

  workouts.forEach((workout) => {
    workoutCounts[workout.type] = (workoutCounts[workout.type] || 0) + 1;
  });

  let mostCommonType = "";
  let highestCount = 0;

  for (const type in workoutCounts) {
    if (workoutCounts[type] > highestCount) {
      highestCount = workoutCounts[type];
      mostCommonType = type;
    }
  }

  commonEl.textContent = `${mostCommonType} (${highestCount})`;
}