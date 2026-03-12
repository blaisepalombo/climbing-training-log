import { saveWorkout } from "./storage.js"

export function initWorkoutForm() {

  const form = document.getElementById("workoutForm")

  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const workout = {
      date: document.getElementById("date").value,
      type: document.getElementById("type").value,
      exercise: document.getElementById("exercise").value,
      sets: document.getElementById("sets").value,
      reps: document.getElementById("reps").value,
      notes: document.getElementById("notes").value
    }

    saveWorkout(workout)

    form.reset()

    alert("Workout saved")
  })

}