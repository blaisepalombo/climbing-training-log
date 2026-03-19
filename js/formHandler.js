import { saveWorkout } from "./storage.js";
import { buildWorkoutFromForm, validateWorkout } from "./trainingLog.js";
import { populateExerciseOptions } from "./exerciseAPI.js";
import { formatDateForInput, qs, showMessage } from "./utils.js";

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

  typeSelect.addEventListener("change", async () => {
    await populateExerciseOptions(typeSelect.value, exerciseSelect, apiMessage);
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

    dateInput.value = formatDateForInput();
    await populateExerciseOptions(typeSelect.value, exerciseSelect, apiMessage);

    showMessage(messageBox, "Workout saved successfully.");
  });
}