import { getWorkouts } from "./storage.js"

export function displayProgress() {
  const totalWorkouts = document.getElementById("totalWorkouts")
  const commonWorkout = document.getElementById("commonWorkout")

  if (!totalWorkouts || !commonWorkout) return

  const workouts = getWorkouts()

  totalWorkouts.textContent = workouts.length

  if (workouts.length === 0) {
    commonWorkout.textContent = "None yet"
    return
  }

  const workoutTypes = {}

  workouts.forEach((workout) => {
    const type = workout.type
    workoutTypes[type] = (workoutTypes[type] || 0) + 1
  })

  let mostCommon = ""
  let highestCount = 0

  for (const type in workoutTypes) {
    if (workoutTypes[type] > highestCount) {
      highestCount = workoutTypes[type]
      mostCommon = type
    }
  }

  commonWorkout.textContent = mostCommon
}