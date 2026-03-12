import { getWorkouts } from "./storage.js"

export function displayDashboard() {
  const totalSessions = document.getElementById("totalSessions")
  const recentWorkout = document.getElementById("recentWorkout")

  if (!totalSessions || !recentWorkout) return

  const workouts = getWorkouts()

  totalSessions.textContent = workouts.length

  if (workouts.length === 0) {
    recentWorkout.textContent = "No workouts logged yet."
    return
  }

  const latestWorkout = workouts[workouts.length - 1]

  recentWorkout.textContent = `${latestWorkout.type} - ${latestWorkout.exercise} on ${latestWorkout.date}`
}