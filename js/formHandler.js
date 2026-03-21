import { saveWorkout } from "./storage.js";
import { buildWorkoutFromForm, validateWorkout } from "./trainingLog.js";
import { populateExerciseOptions, getExerciseDetails } from "./exerciseAPI.js";
import { formatDateForInput, qs, showMessage } from "./utils.js";

async function updateExercisePreview(type, exerciseName) {
  const preview = qs("#exercisePreview");
  if (!preview) return;

  if (!exerciseName || type === "Hangboard") {
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = "<p>Loading exercise details...</p>";

  const details = await getExerciseDetails(exerciseName);

  if (!details) {
    preview.innerHTML = "<p>No exercise details available.</p>";
    return;
  }

  preview.innerHTML = `
    <div class="exercise-preview-card">
      <h3>${details.name || exerciseName}</h3>
      <p><strong>Target:</strong> ${details.target || "N/A"}</p>
      <p><strong>Equipment:</strong> ${details.equipment || "N/A"}</p>
      ${
        details.gifUrl
          ? `<img src="${details.gifUrl}" alt="${exerciseName}" class="exercise-preview-image">`
          : ""
      }
    </div>
  `;
}

export async function initWorkoutForm() {
  const form = qs("#workoutForm");
  if (!form) return;

  const dateInput = qs("#date");
  const typeSelect = qs("#type");
  const exerciseSelect = qs("#exercise");
  const messageBox = qs("#formMessage");
  const apiMessage = qs("#apiMessage");

  if (dateInput) {
    dateInput.value = formatDateForInput();
  }

  await populateExerciseOptions(typeSelect.value, exerciseSelect, apiMessage);
  await updateExercisePreview(typeSelect.value, exerciseSelect.value);

  typeSelect.addEventListener("change", async () => {
    await populateExerciseOptions(typeSelect.value, exerciseSelect, apiMessage);
    await updateExercisePreview(typeSelect.value, exerciseSelect.value);
  });

  exerciseSelect.addEventListener("change", async () => {
    await updateExercisePreview(typeSelect.value, exerciseSelect.value);
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
    form.reset();

    if (dateInput) {
      dateInput.value = formatDateForInput();
    }

    await populateExerciseOptions(typeSelect.value, exerciseSelect, apiMessage);
    await updateExercisePreview(typeSelect.value, exerciseSelect.value);

    showMessage(messageBox, "Workout saved successfully.");
  });
}