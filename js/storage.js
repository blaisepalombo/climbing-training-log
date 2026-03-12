export function getWorkouts() {
  const data = localStorage.getItem("workouts")
  return data ? JSON.parse(data) : []
}

export function saveWorkout(workout) {
  const workouts = getWorkouts()
  workouts.push(workout)
  localStorage.setItem("workouts", JSON.stringify(workouts))
}