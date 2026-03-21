document.addEventListener("DOMContentLoaded", async () => {
  if (document.querySelector("#workoutForm")) {
    const { initWorkoutForm } = await import("./formHandler.js");
    await initWorkoutForm();
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
      displayDashboard();
    } catch (error) {
      console.warn("Dashboard module not loaded:", error);
    }
  }

  if (document.querySelector("#progressPage")) {
    try {
      const { displayProgress } = await import("./progress.js");
      displayProgress();
    } catch (error) {
      console.warn("Progress module not loaded:", error);
    }
  }
});