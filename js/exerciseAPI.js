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
    "ARC training",
    "Jump rope",
    "Bike intervals",
    "Core circuit",
    "Shoulder stability",
    "Mobility session"
  ]
};

function getStrengthSearchTerms() {
  return ["pull up", "row", "deadlift", "curl", "plank", "push up"];
}

async function fetchAllExercises() {
  const response = await fetch(EXERCISE_API_CONFIG.baseUrl, {
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

function filterStrengthExercises(exercises) {
  const terms = getStrengthSearchTerms();

  const filtered = exercises
    .filter((exercise) => {
      const name = exercise.name?.toLowerCase() || "";
      return terms.some((term) => name.includes(term));
    })
    .map((exercise) => exercise.name)
    .filter(Boolean);

  return [...new Set(filtered)].slice(0, 20);
}

export async function getExercisesByType(type) {
  if (type === "Hangboard" || type === "Conditioning") {
    return LOCAL_EXERCISES[type] || [];
  }

  if (type === "Strength") {
    const data = await fetchAllExercises();
    const filtered = filterStrengthExercises(data);

    if (filtered.length > 0) {
      return filtered;
    }

    return [
      "Pull up",
      "Row",
      "Deadlift",
      "Curl",
      "Push up"
    ];
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
      ${exercises.map((exercise) => `<option value="${exercise}">${exercise}</option>`).join("")}
    `;

    if (messageElement) {
      messageElement.textContent =
        type === "Strength"
          ? "Strength exercises loaded from the external API."
          : "Climbing exercise list loaded.";
      messageElement.className = "form-message success";
    }
  } catch (error) {
    console.error("Exercise API error:", error);

    const fallback = LOCAL_EXERCISES[type] || [];

    selectElement.innerHTML = `
      <option value="">Select an exercise</option>
      ${fallback.map((exercise) => `<option value="${exercise}">${exercise}</option>`).join("")}
    `;

    if (messageElement) {
      messageElement.textContent = "API could not load. Using fallback exercises.";
      messageElement.className = "form-message error";
    }
  }
}