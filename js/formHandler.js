import { saveWorkout } from "./storage.js";
import { buildWorkoutFromForm, validateWorkout } from "./trainingLog.js";
import { getExercisesByType, getExercisePreview } from "./exerciseAPI.js";
import { formatDateForInput, qs, showMessage } from "./utils.js";

function getStepElements() {
  return Array.from(document.querySelectorAll(".form-step"));
}

function updateStepPills(activeStep) {
  const pills = Array.from(document.querySelectorAll(".step-pill"));

  pills.forEach((pill, index) => {
    pill.classList.toggle("active", index === activeStep);
    pill.classList.toggle("complete", index < activeStep);
  });
}

function showStep(stepIndex) {
  const steps = getStepElements();

  steps.forEach((step, index) => {
    const isActive = index === stepIndex;
    step.classList.toggle("active", isActive);
    step.hidden = !isActive;
  });

  updateStepPills(stepIndex);
}

function isStepValid(stepIndex) {
  if (stepIndex === 0) {
    const dateInput = qs("#date");
    return Boolean(dateInput?.value);
  }

  if (stepIndex === 1) {
    const typeSelect = qs("#type");
    return Boolean(typeSelect?.value);
  }

  if (stepIndex === 2) {
    const exerciseInput = qs("#exercise");
    const customExercise = qs("#customExercise");
    return Boolean(exerciseInput?.value || customExercise?.value.trim());
  }

  return true;
}

function wireStepButtons(messageBox) {
  const nextButtons = Array.from(document.querySelectorAll("[data-next-step]"));
  const backButtons = Array.from(document.querySelectorAll("[data-prev-step]"));

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentStep = Number(button.dataset.currentStep);
      const nextStep = Number(button.dataset.nextStep);

      if (!isStepValid(currentStep)) {
        showMessage(messageBox, "Please complete this step before moving on.", true);
        return;
      }

      showMessage(messageBox, "");
      showStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prevStep = Number(button.dataset.prevStep);
      showMessage(messageBox, "");
      showStep(prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function updateSliderDisplays() {
  const setsInput = qs("#sets");
  const repsInput = qs("#reps");
  const setsValue = qs("#setsValue");
  const repsValue = qs("#repsValue");

  if (setsInput && setsValue) {
    setsValue.textContent = setsInput.value;
  }

  if (repsInput && repsValue) {
    repsValue.textContent = repsInput.value;
  }
}

function updateSummary() {
  const dateInput = qs("#date");
  const typeSelect = qs("#type");
  const exerciseInput = qs("#exercise");
  const customExercise = qs("#customExercise");
  const setsInput = qs("#sets");
  const repsInput = qs("#reps");
  const notesInput = qs("#notes");
  const summaryBox = qs("#workoutSummary");

  if (!summaryBox) return;

  const chosenExercise = customExercise?.value.trim() || exerciseInput?.value || "Not selected";

  summaryBox.innerHTML = `
    <div class="summary-grid">
      <div><strong>Date</strong><span>${dateInput?.value || "Not selected"}</span></div>
      <div><strong>Type</strong><span>${typeSelect?.value || "Not selected"}</span></div>
      <div><strong>Exercise</strong><span>${chosenExercise}</span></div>
      <div><strong>Sets</strong><span>${setsInput?.value || "-"}</span></div>
      <div><strong>Reps / Seconds</strong><span>${repsInput?.value || "-"}</span></div>
      <div><strong>Notes</strong><span>${notesInput?.value.trim() || "-"}</span></div>
    </div>
  `;
}

async function renderExerciseGrid(type) {
  const grid = qs("#exerciseGrid");
  const exerciseInput = qs("#exercise");
  const apiMessage = qs("#apiMessage");

  if (!grid || !exerciseInput) return;

  grid.innerHTML = `<p class="loading-text">Loading exercises...</p>`;

  try {
    const exercises = await getExercisesByType(type);

    if (!exercises.length) {
      grid.innerHTML = `<p class="loading-text">No exercises available for this type.</p>`;
      if (apiMessage) {
        apiMessage.textContent = "No exercises found.";
        apiMessage.className = "form-message error";
      }
      exerciseInput.value = "";
      return;
    }

    grid.innerHTML = exercises
      .map((name) => {
        const preview = getExercisePreview(type, name);

        return `
          <button
            type="button"
            class="exercise-card"
            data-name="${name}"
            aria-pressed="false"
          >
            <div class="exercise-card-icon">${preview?.icon || "💪"}</div>
            <div class="exercise-card-content">
              <h4>${name}</h4>
              <p>${preview?.description || "Exercise description."}</p>
            </div>
          </button>
        `;
      })
      .join("");

    if (apiMessage) {
      apiMessage.textContent = "Exercise list loaded.";
      apiMessage.className = "form-message success";
    }

    grid.querySelectorAll(".exercise-card").forEach((card) => {
      card.addEventListener("click", () => {
        const selectedName = card.dataset.name || "";

        grid.querySelectorAll(".exercise-card").forEach((otherCard) => {
          otherCard.classList.remove("selected");
          otherCard.setAttribute("aria-pressed", "false");
        });

        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");
        exerciseInput.value = selectedName;

        const customExercise = qs("#customExercise");
        if (customExercise) {
          customExercise.value = "";
        }

        updateSummary();
      });
    });
  } catch (error) {
    console.error("Exercise grid error:", error);
    grid.innerHTML = `<p class="loading-text">Could not load exercises.</p>`;
    exerciseInput.value = "";

    if (apiMessage) {
      apiMessage.textContent = "Could not load exercises.";
      apiMessage.className = "form-message error";
    }
  }
}

function showSubmitOverlay() {
  const overlay = qs("#submitOverlay");
  if (!overlay) return;

  overlay.classList.remove("hidden");
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 250);
  }, 1500);
}

export async function initWorkoutForm() {
  const form = qs("#workoutForm");
  if (!form) return;

  const dateInput = qs("#date");
  const typeSelect = qs("#type");
  const customExercise = qs("#customExercise");
  const setsInput = qs("#sets");
  const repsInput = qs("#reps");
  const notesInput = qs("#notes");
  const messageBox = qs("#formMessage");

  if (!form || !typeSelect) return;

  if (dateInput) {
    dateInput.value = formatDateForInput();
  }

  updateSliderDisplays();
  await renderExerciseGrid(typeSelect.value);
  updateSummary();
  wireStepButtons(messageBox);
  showStep(0);

  typeSelect.addEventListener("change", async () => {
    await renderExerciseGrid(typeSelect.value);
    updateSummary();
  });

  customExercise?.addEventListener("input", () => {
    const exerciseInput = qs("#exercise");
    const grid = qs("#exerciseGrid");

    if (customExercise.value.trim() && exerciseInput) {
      exerciseInput.value = "";
    }

    if (grid && customExercise.value.trim()) {
      grid.querySelectorAll(".exercise-card").forEach((card) => {
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
      });
    }

    updateSummary();
  });

  dateInput?.addEventListener("input", updateSummary);
  typeSelect.addEventListener("input", updateSummary);

  setsInput?.addEventListener("input", () => {
    updateSliderDisplays();
    updateSummary();
  });

  repsInput?.addEventListener("input", () => {
    updateSliderDisplays();
    updateSummary();
  });

  notesInput?.addEventListener("input", updateSummary);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const workout = buildWorkoutFromForm(form);
    const validation = validateWorkout(workout);

    if (!validation.isValid) {
      showMessage(messageBox, validation.message, true);
      return;
    }

    saveWorkout(workout);
    showSubmitOverlay();

    form.reset();

    if (dateInput) {
      dateInput.value = formatDateForInput();
    }

    if (setsInput) {
      setsInput.value = "3";
    }

    if (repsInput) {
      repsInput.value = "10";
    }

    updateSliderDisplays();
    await renderExerciseGrid(typeSelect.value);
    updateSummary();
    showStep(0);

    showMessage(messageBox, "Workout saved successfully.");
  });
}