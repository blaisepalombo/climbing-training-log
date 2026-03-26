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

export function saveAllWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function saveWorkout(workout) {
  const workouts = getWorkouts();
  workouts.push(workout);
  saveAllWorkouts(workouts);
}

export function updateWorkoutStatus(id, newStatus) {
  const workouts = getWorkouts();
  const updated = workouts.map((workout) =>
    workout.id === id ? { ...workout, status: newStatus } : workout
  );
  saveAllWorkouts(updated);
}

export function deleteWorkout(id) {
  const workouts = getWorkouts();
  const updated = workouts.filter((workout) => workout.id !== id);
  saveAllWorkouts(updated);
}

export function clearWorkouts() {
  localStorage.removeItem(STORAGE_KEY);
}