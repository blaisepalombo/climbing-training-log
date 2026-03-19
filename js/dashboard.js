import { getWorkouts } from "./storage.js";

export function displayDashboard() {
  const totalEl = document.querySelector("#totalSessions");
  const recentEl = document.querySelector("#recentWorkout");

  if (!totalEl || !recentEl) return;

  const workouts = getWorkouts();

  totalEl.textContent = workouts.length;

  if (workouts.length === 0) {
    recentEl.textContent = "No workouts logged yet.";
    return;
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recentWorkout = sortedWorkouts[0];
  recentEl.textContent = `${recentWorkout.date} - ${recentWorkout.type} - ${recentWorkout.exercise}`;
}