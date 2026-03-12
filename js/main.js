import { initWorkoutForm } from "./formHandler.js"
import { displayWorkoutHistory } from "./history.js"
import { displayDashboard } from "./dashboard.js"
import { displayProgress } from "./progress.js"

document.addEventListener("DOMContentLoaded", () => {
  initWorkoutForm()
  displayWorkoutHistory()
  displayDashboard()
  displayProgress()
})