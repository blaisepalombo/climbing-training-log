import { getWorkouts } from "./storage.js";
import { getRandomQuote } from "./quotes.js";

function displayWorkoutSummary() {
  const totalEl = document.querySelector("#totalSessions");
  const recentEl = document.querySelector("#recentWorkout");

  if (!totalEl || !recentEl) return;

  const workouts = getWorkouts();
  totalEl.textContent = workouts.length;

  if (workouts.length === 0) {
    recentEl.textContent = "No workouts logged yet.";
    return;
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recentWorkout = sortedWorkouts[0];
  recentEl.textContent = `${recentWorkout.date} - ${recentWorkout.type} - ${recentWorkout.exercise}`;
}

async function loadQuote() {
  const quoteTextEl = document.querySelector("#quoteText");
  const quoteAuthorEl = document.querySelector("#quoteAuthor");
  const quoteStatusEl = document.querySelector("#quoteStatus");
  const newQuoteBtn = document.querySelector("#newQuoteBtn");

  if (!quoteTextEl || !quoteAuthorEl || !quoteStatusEl || !newQuoteBtn) return;

  quoteStatusEl.textContent = "Loading quote...";
  newQuoteBtn.disabled = true;
  newQuoteBtn.textContent = "Loading...";

  try {
    const quote = await getRandomQuote();

    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `— ${quote.author}`;
    quoteStatusEl.textContent = "";
  } catch (error) {
    console.error("Quote loading error:", error);

    quoteTextEl.textContent = `"Keep showing up. Small progress still counts."`;
    quoteAuthorEl.textContent = "— Training Log";
    quoteStatusEl.textContent = "Could not load a live quote right now.";
  } finally {
    newQuoteBtn.disabled = false;
    newQuoteBtn.textContent = "New Quote";
  }
}

export async function displayDashboard() {
  displayWorkoutSummary();

  const newQuoteBtn = document.querySelector("#newQuoteBtn");

  if (newQuoteBtn && !newQuoteBtn.dataset.bound) {
    newQuoteBtn.addEventListener("click", loadQuote);
    newQuoteBtn.dataset.bound = "true";
  }

  await loadQuote();
}