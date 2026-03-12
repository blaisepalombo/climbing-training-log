import { getWorkouts } from "./storage.js"

export function displayWorkoutHistory() {
  const historyList = document.getElementById("historyList")

  if (!historyList) return

  const workouts = getWorkouts()

  if (workouts.length === 0) {
    historyList.innerHTML = "<p>No workouts logged yet.</p>"
    return
  }

  historyList.innerHTML = ""

  workouts.forEach((workout) => {
    const workoutCard = document.createElement("article")
    workoutCard.classList.add("workout-card")

    workoutCard.innerHTML = `
      <h3>${workout.type}</h3>
      <p><strong>Date:</strong> ${workout.date}</p>
      <p><strong>Exercise:</strong> ${workout.exercise}</p>
      <p><strong>Sets:</strong> ${workout.sets}</p>
      <p><strong>Reps:</strong> ${workout.reps}</p>
      <p><strong>Notes:</strong> ${workout.notes}</p>
    `

    historyList.appendChild(workoutCard)
  })
}