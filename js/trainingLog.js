import { cleanText, toNumberOrNull } from "./utils.js";

export function buildWorkoutFromForm(form) {
  const formData = new FormData(form);

  const selectedExercise = cleanText(formData.get("exercise"));
  const customExercise = cleanText(formData.get("customExercise"));

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: cleanText(formData.get("date")),
    type: cleanText(formData.get("type")),
    exercise: customExercise || selectedExercise,
    sets: toNumberOrNull(formData.get("sets")),
    reps: toNumberOrNull(formData.get("reps")),
    notes: cleanText(formData.get("notes")),
    createdAt: new Date().toISOString()
  };
}

export function validateWorkout(workout) {
  if (!workout.date) {
    return {
      isValid: false,
      message: "Please choose a date."
    };
  }

  if (!workout.type) {
    return {
      isValid: false,
      message: "Please choose a workout type."
    };
  }

  if (!workout.exercise) {
    return {
      isValid: false,
      message: "Please choose an exercise or enter a custom one."
    };
  }

  if (workout.sets !== null && workout.sets < 0) {
    return {
      isValid: false,
      message: "Sets cannot be negative."
    };
  }

  if (workout.reps !== null && workout.reps < 0) {
    return {
      isValid: false,
      message: "Reps cannot be negative."
    };
  }

  return {
    isValid: true,
    message: "Workout is valid."
  };
}