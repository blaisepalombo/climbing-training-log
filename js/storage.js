const STORAGE_KEY = "climbing-workouts";

export function getWorkouts() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not parse saved workouts:", error);
    return [];
  }
}

export function saveWorkout(workout) {
  const workouts = getWorkouts();
  workouts.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function clearWorkouts() {
  localStorage.removeItem(STORAGE_KEY);
}