import { EXERCISE_API_CONFIG } from "./apiConfig.js";

const LOCAL_EXERCISES = {
  Hangboard: [
    "Max hangs",
    "Repeaters",
    "Half crimp hangs",
    "Open hand hangs",
    "Three finger drag hangs",
    "Density hangs"
  ],
  Conditioning: [
    "ARC Training",
    "Jump Rope",
    "Bike Intervals",
    "Core Circuit",
    "Shoulder Stability",
    "Mobility Session"
  ],
  Strength: [
    "Pull Up",
    "Row",
    "Deadlift",
    "Curl",
    "Push Up",
    "Plank"
  ]
};

function getStrengthSearchTerms() {
  return [
    "pull",
    "push",
    "press",
    "row",
    "deadlift",
    "curl",
    "squat",
    "dip",
    "plank",
    "extension",
    "raise",
    "fly",
    "pulldown"
  ];
}

function getConditioningSearchTerms() {
  return [
    "jump",
    "jack",
    "burpee",
    "mountain climber",
    "run",
    "high knees",
    "rope",
    "step",
    "lunge",
    "plank",
    "crunch",
    "sit-up",
    "sit up",
    "twist",
    "cardio"
  ];
}

async function fetchFromApi(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": EXERCISE_API_CONFIG.rapidApiKey,
      "X-RapidAPI-Host": EXERCISE_API_CONFIG.rapidApiHost
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchAllExercises() {
  return fetchFromApi(EXERCISE_API_CONFIG.baseUrl);
}

function formatExerciseName(name) {
  if (!name) return "";

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function uniqueSortedNames(exercises, limit = 40) {
  return [...new Set(
    exercises
      .map((exercise) => formatExerciseName(exercise.name))
      .filter(Boolean)
  )]
    .sort()
    .slice(0, limit);
}

function getExercisesByTerms(exercises, terms, limit = 40) {
  const filtered = exercises.filter((exercise) => {
    const name = exercise.name?.toLowerCase() || "";
    return terms.some((term) => name.includes(term));
  });

  return uniqueSortedNames(filtered, limit);
}

function getConditioningFallbackFromDataset(exercises, limit = 40) {
  const broaderFiltered = exercises.filter((exercise) => {
    const name = exercise.name?.toLowerCase() || "";
    const bodyPart = exercise.bodyPart?.toLowerCase() || "";
    const equipment = exercise.equipment?.toLowerCase() || "";
    const target = exercise.target?.toLowerCase() || "";

    return (
      equipment.includes("body weight") ||
      equipment.includes("bodyweight") ||
      bodyPart.includes("cardio") ||
      bodyPart.includes("waist") ||
      target.includes("cardiovascular system") ||
      name.includes("jump") ||
      name.includes("burpee") ||
      name.includes("mountain climber") ||
      name.includes("jack") ||
      name.includes("high knees") ||
      name.includes("plank") ||
      name.includes("crunch") ||
      name.includes("sit")
    );
  });

  return uniqueSortedNames(broaderFiltered, limit);
}

export async function getExerciseDetails(name) {
  if (!name) return null;

  try {
    const data = await fetchFromApi(
      `${EXERCISE_API_CONFIG.baseUrl}/name/${encodeURIComponent(name.toLowerCase())}`
    );

    return data[0] || null;
  } catch (error) {
    console.error("Exercise details error:", error);
    return null;
  }
}

export async function getExercisesByType(type) {
  if (type === "Hangboard") {
    return LOCAL_EXERCISES[type] || [];
  }

  const data = await fetchAllExercises();

  if (type === "Strength") {
    const filtered = getExercisesByTerms(data, getStrengthSearchTerms(), 40);
    return filtered.length > 0 ? filtered : LOCAL_EXERCISES.Strength;
  }

  if (type === "Conditioning") {
    let filtered = getExercisesByTerms(data, getConditioningSearchTerms(), 40);

    if (filtered.length < 8) {
      filtered = getConditioningFallbackFromDataset(data, 40);
    }

    return filtered.length > 0 ? filtered : LOCAL_EXERCISES.Conditioning;
  }

  return [];
}

export async function populateExerciseOptions(type, selectElement, messageElement) {
  if (!selectElement) return;

  selectElement.innerHTML = `<option value="">Loading exercises...</option>`;

  try {
    const exercises = await getExercisesByType(type);

    selectElement.innerHTML = `
      <option value="">Select an exercise</option>
      ${exercises
        .map((exercise) => `<option value="${exercise}">${exercise}</option>`)
        .join("")}
    `;

    if (messageElement) {
      messageElement.textContent =
        type === "Hangboard"
          ? "Climbing exercise list loaded."
          : `${type} exercises loaded from the external API.`;
      messageElement.className = "form-message success";
    }
  } catch (error) {
    console.error("Exercise API error:", error);

    const fallback = LOCAL_EXERCISES[type] || [];

    selectElement.innerHTML = `
      <option value="">Select an exercise</option>
      ${fallback
        .map((exercise) => `<option value="${exercise}">${exercise}</option>`)
        .join("")}
    `;

    if (messageElement) {
      messageElement.textContent = "API could not load. Using fallback exercises.";
      messageElement.className = "form-message error";
    }
  }
}