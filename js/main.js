import { initMobileNav } from "./nav.js";

document.addEventListener("DOMContentLoaded", async () => {
  initMobileNav();

  if (document.querySelector("#workoutForm")) {
    try {
      const { initWorkoutForm } = await import("./formHandler.js");
      await initWorkoutForm();
    } catch (error) {
      console.warn("Form module not loaded:", error);
    }
  }

  if (document.querySelector("#historyList")) {
    try {
      const { displayWorkoutHistory } = await import("./history.js");
      await displayWorkoutHistory();
    } catch (error) {
      console.warn("History module not loaded:", error);
    }
  }

  if (document.querySelector("#totalSessions")) {
    try {
      const { displayDashboard } = await import("./dashboard.js");
      await displayDashboard();
    } catch (error) {
      console.warn("Dashboard module not loaded:", error);
    }
  }

  if (document.querySelector("#overallCounts")) {
    try {
      const { displayProgress } = await import("./progress.js");
      displayProgress();
    } catch (error) {
      console.warn("Progress module not loaded:", error);
    }
  }
});