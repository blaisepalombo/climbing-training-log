import { saveWorkout } from "./storage.js";
import { buildWorkoutFromForm, validateWorkout } from "./trainingLog.js";
import { getExercisesByType, getExercisePreview } from "./exercises.js";
import { formatDateForInput, qs, showMessage } from "./utils.js";

const CLIMBING_TYPES = ["Bouldering", "Top Rope", "Lead"];
const TRAINING_TYPES = ["Hangboard", "Strength", "Conditioning"];

const BOULDER_GRADES = [
  "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6",
  "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"
];

const ROPE_GRADES = [
  "5.6", "5.7", "5.8", "5.9",
  "5.10a", "5.10b", "5.10c", "5.10d",
  "5.11a", "5.11b", "5.11c", "5.11d",
  "5.12a", "5.12b", "5.12c", "5.12d",
  "5.13a", "5.13b", "5.13c", "5.13d",
  "5.14a", "5.14b", "5.14c", "5.14d",
  "5.15a", "5.15b", "5.15c", "5.15d"
];

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

function isClimbingType(type) {
  return CLIMBING_TYPES.includes(type);
}

function isTrainingType(type) {
  return TRAINING_TYPES.includes(type);
}

function populateGradeOptions(type) {
  const gradeSelect = qs("#grade");
  if (!gradeSelect) return;

  let grades = [];

  if (type === "Bouldering") {
    grades = BOULDER_GRADES;
  } else if (type === "Top Rope" || type === "Lead") {
    grades = ROPE_GRADES;
  }

  gradeSelect.innerHTML = `
    <option value="">Select grade</option>
    ${grades.map((grade) => `<option value="${grade}">${grade}</option>`).join("")}
  `;
}

function updateClimbingText(type) {
  const sessionInfoText = qs("#sessionInfoText");
  const gradeLabel = document.querySelector('label[for="grade"]');
  const projectNameLabel = document.querySelector('label[for="projectName"]');

  if (!sessionInfoText || !gradeLabel || !projectNameLabel) return;

  if (type === "Bouldering") {
    sessionInfoText.textContent = "Log the gym, the grade, and whether you completed it or are still working on it.";
    gradeLabel.textContent = "Boulder Grade";
    projectNameLabel.textContent = "Problem Name (optional)";
    return;
  }

  if (type === "Top Rope") {
    sessionInfoText.textContent = "Log the gym, route grade, and whether you completed it or it is still in progress.";
    gradeLabel.textContent = "Route Grade";
    projectNameLabel.textContent = "Route Name (optional)";
    return;
  }

  if (type === "Lead") {
    sessionInfoText.textContent = "Log the gym, route grade, and whether you completed it or are still projecting it.";
    gradeLabel.textContent = "Route Grade";
    projectNameLabel.textContent = "Route Name (optional)";
    return;
  }

  sessionInfoText.textContent = "Fill out the details for your entry.";
  gradeLabel.textContent = "Grade";
  projectNameLabel.textContent = "Route or Problem Name (optional)";
}

function toggleSessionFields(type) {
  const climbingFields = qs("#climbingFields");
  const trainingFields = qs("#trainingFields");
  const apiMessage = qs("#apiMessage");

  if (climbingFields) {
    climbingFields.hidden = !isClimbingType(type);
  }

  if (trainingFields) {
    trainingFields.hidden = !isTrainingType(type);
  }

  if (apiMessage && isClimbingType(type)) {
    apiMessage.textContent = "";
    apiMessage.className = "form-message";
  }

  if (isClimbingType(type)) {
    populateGradeOptions(type);
    updateClimbingText(type);
  }
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

function isStepValid(stepIndex) {
  if (stepIndex === 0) {
    return Boolean(qs("#date")?.value);
  }

  if (stepIndex === 1) {
    return Boolean(qs("#type")?.value);
  }

  if (stepIndex === 2) {
    const type = qs("#type")?.value;

    if (isClimbingType(type)) {
      const gym = qs("#gym")?.value.trim();
      const grade = qs("#grade")?.value;
      const status = qs("#status")?.value;
      return Boolean(gym && grade && status);
    }

    if (isTrainingType(type)) {
      const exerciseInput = qs("#exercise");
      const customExercise = qs("#customExercise");
      return Boolean(exerciseInput?.value || customExercise?.value.trim());
    }
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
      updateSummary();
      showStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prevStep = Number(button.dataset.prevStep);
      showMessage(messageBox, "");
      updateSummary();
      showStep(prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function updateSummary() {
  const type = qs("#type")?.value || "";
  const summaryBox = qs("#workoutSummary");

  if (!summaryBox) return;

  const date = qs("#date")?.value || "Not selected";
  const notes = qs("#notes")?.value.trim() || "-";

  if (isClimbingType(type)) {
    const gym = qs("#gym")?.value.trim() || "-";
    const grade = qs("#grade")?.value || "-";
    const status = qs("#status")?.value || "-";
    const projectName = qs("#projectName")?.value.trim() || "-";

    summaryBox.innerHTML = `
      <div class="summary-grid">
        <div><strong>Date</strong><span>${date}</span></div>
        <div><strong>Type</strong><span>${type}</span></div>
        <div><strong>Gym</strong><span>${gym}</span></div>
        <div><strong>Grade</strong><span>${grade}</span></div>
        <div><strong>Status</strong><span>${status}</span></div>
        <div><strong>Name</strong><span>${projectName}</span></div>
        <div><strong>Notes</strong><span>${notes}</span></div>
      </div>
    `;
    return;
  }

  const chosenExercise =
    qs("#customExercise")?.value.trim() || qs("#exercise")?.value || "Not selected";
  const sets = qs("#sets")?.value || "-";
  const reps = qs("#reps")?.value || "-";

  summaryBox.innerHTML = `
    <div class="summary-grid">
      <div><strong>Date</strong><span>${date}</span></div>
      <div><strong>Type</strong><span>${type}</span></div>
      <div><strong>Exercise</strong><span>${chosenExercise}</span></div>
      <div><strong>Sets</strong><span>${sets}</span></div>
      <div><strong>Reps / Seconds</strong><span>${reps}</span></div>
      <div><strong>Notes</strong><span>${notes}</span></div>
    </div>
  `;
}

async function renderExerciseGrid(type) {
  const grid = qs("#exerciseGrid");
  const exerciseInput = qs("#exercise");
  const apiMessage = qs("#apiMessage");

  if (!grid || !exerciseInput) return;

  if (!isTrainingType(type)) {
    grid.innerHTML = "";
    exerciseInput.value = "";
    if (apiMessage) {
      apiMessage.textContent = "";
      apiMessage.className = "form-message";
    }
    return;
  }

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

function clearTrainingSelection() {
  const exerciseInput = qs("#exercise");
  const customExercise = qs("#customExercise");
  const grid = qs("#exerciseGrid");

  if (exerciseInput) exerciseInput.value = "";
  if (customExercise) customExercise.value = "";

  if (grid) {
    grid.querySelectorAll(".exercise-card").forEach((card) => {
      card.classList.remove("selected");
      card.setAttribute("aria-pressed", "false");
    });
  }
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

  const climbingInputs = [
    qs("#gym"),
    qs("#grade"),
    qs("#status"),
    qs("#projectName")
  ];

  if (!typeSelect) return;

  if (dateInput) {
    dateInput.value = formatDateForInput();
  }

  toggleSessionFields(typeSelect.value);
  updateSliderDisplays();
  await renderExerciseGrid(typeSelect.value);
  updateSummary();
  wireStepButtons(messageBox);
  showStep(0);

  typeSelect.addEventListener("change", async () => {
    toggleSessionFields(typeSelect.value);

    if (isClimbingType(typeSelect.value)) {
      clearTrainingSelection();
    }

    updateSummary();
    await renderExerciseGrid(typeSelect.value);
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
  notesInput?.addEventListener("input", updateSummary);

  climbingInputs.forEach((input) => {
    input?.addEventListener("input", updateSummary);
    input?.addEventListener("change", updateSummary);
  });

  setsInput?.addEventListener("input", () => {
    updateSliderDisplays();
    updateSummary();
  });

  repsInput?.addEventListener("input", () => {
    updateSliderDisplays();
    updateSummary();
  });

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

    if (typeSelect) {
      typeSelect.value = "Bouldering";
    }

    if (setsInput) {
      setsInput.value = "3";
    }

    if (repsInput) {
      repsInput.value = "10";
    }

    toggleSessionFields(typeSelect.value);
    updateSliderDisplays();
    await renderExerciseGrid(typeSelect.value);
    updateSummary();
    showStep(0);

    showMessage(messageBox, "Entry saved successfully.");
  });
}