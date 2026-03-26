const CLIMBING_TYPES = ["Bouldering", "Top Rope", "Lead"];
const TRAINING_TYPES = ["Hangboard", "Strength", "Conditioning"];

function isClimbingType(type) {
  return CLIMBING_TYPES.includes(type);
}

function isTrainingType(type) {
  return TRAINING_TYPES.includes(type);
}

export function buildWorkoutFromForm(form) {
  const type = form.type.value;
  const customExercise = form.customExercise?.value.trim() || "";
  const selectedExercise = form.exercise?.value || "";
  const chosenExercise = customExercise || selectedExercise;

  const workout = {
    id: crypto.randomUUID(),
    date: form.date.value,
    type,
    notes: form.notes?.value.trim() || "",
    createdAt: new Date().toISOString()
  };

  if (isClimbingType(type)) {
    workout.gym = form.gym?.value.trim() || "";
    workout.grade = form.grade?.value || "";
    workout.status = form.status?.value || "";
    workout.projectName = form.projectName?.value.trim() || "";
  }

  if (isTrainingType(type)) {
    workout.exercise = chosenExercise;
    workout.sets = Number(form.sets?.value) || 0;
    workout.reps = Number(form.reps?.value) || 0;
  }

  return workout;
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
      message: "Please choose a type."
    };
  }

  if (isClimbingType(workout.type)) {
    if (!workout.gym) {
      return {
        isValid: false,
        message: "Please enter a gym."
      };
    }

    if (!workout.grade) {
      return {
        isValid: false,
        message: "Please choose a grade."
      };
    }

    if (!workout.status) {
      return {
        isValid: false,
        message: "Please choose a status."
      };
    }
  }

  if (isTrainingType(workout.type) && !workout.exercise) {
    return {
      isValid: false,
      message: "Please choose or enter an exercise."
    };
  }

  return {
    isValid: true,
    message: ""
  };
}

export function isClimbingSession(workout) {
  return isClimbingType(workout.type);
}

export function isTrainingSession(workout) {
  return isTrainingType(workout.type);
}

export function isProject(workout) {
  return isClimbingType(workout.type) && workout.status === "in_progress";
}