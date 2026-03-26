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
    "Weighted Pull Up",
    "Lock Off",
    "Row",
    "Deadlift",
    "Finger Curl",
    "Push Up",
    "Plank"
  ]
};

const EXERCISE_PREVIEWS = {
  "Max hangs": {
    icon: "🧗",
    description: "Short high-effort finger hangs used to build max grip strength on edges."
  },
  Repeaters: {
    icon: "⏱️",
    description: "Timed hang intervals with short rests to build forearm endurance and finger strength."
  },
  "Half crimp hangs": {
    icon: "🖐️",
    description: "Fingerboard hangs in a half crimp position to train a common climbing grip safely."
  },
  "Open hand hangs": {
    icon: "🤲",
    description: "Open-hand grip hangs that help with control and reduce stress compared to hard crimping."
  },
  "Three finger drag hangs": {
    icon: "👌",
    description: "Three-finger drag training that targets open-hand strength and grip variety."
  },
  "Density hangs": {
    icon: "📈",
    description: "Longer lower-intensity hangs for time under tension and finger endurance."
  },
  "ARC Training": {
    icon: "🧗‍♂️",
    description: "Low-intensity steady climbing to improve aerobic endurance and recovery on the wall."
  },
  "Jump Rope": {
    icon: "🪢",
    description: "Simple cardio work that improves rhythm, footwork, and general conditioning."
  },
  "Bike Intervals": {
    icon: "🚴",
    description: "Alternating hard and easy efforts on a bike to build cardiovascular fitness."
  },
  "Core Circuit": {
    icon: "💪",
    description: "A mix of trunk exercises to improve body tension and control for climbing."
  },
  "Shoulder Stability": {
    icon: "🦴",
    description: "Accessory work that helps support healthy shoulders and stronger pulling positions."
  },
  "Mobility Session": {
    icon: "🧘",
    description: "Light mobility work to improve movement quality, recovery, and flexibility."
  },
  "Pull Up": {
    icon: "⬆️",
    description: "Classic vertical pulling exercise that builds upper-back and arm strength."
  },
  "Weighted Pull Up": {
    icon: "🏋️",
    description: "A harder pull-up variation used to build higher-end pulling strength."
  },
  "Lock Off": {
    icon: "🪨",
    description: "Isometric pulling work that helps with control on steep terrain and hard moves."
  },
  Row: {
    icon: "🚣",
    description: "Horizontal pulling exercise that trains upper back strength and posture."
  },
  Deadlift: {
    icon: "🏋️‍♂️",
    description: "Compound lift that builds posterior chain strength and overall power."
  },
  "Finger Curl": {
    icon: "✊",
    description: "Forearm and grip accessory work that supports finger and hand strength."
  },
  "Push Up": {
    icon: "📦",
    description: "Simple pushing movement that helps balance out heavy pulling-focused training."
  },
  Plank: {
    icon: "🧱",
    description: "Core stability exercise that helps with tension and body positioning on the wall."
  }
};

export async function getExercisesByType(type) {
  return LOCAL_EXERCISES[type] || [];
}

export function getExercisePreview(type, name) {
  if (!name) return null;

  const preview = EXERCISE_PREVIEWS[name];
  if (preview) return preview;

  const fallbackByType = {
    Hangboard: {
      icon: "🧗",
      description: "A climbing-specific grip exercise focused on finger strength and control."
    },
    Strength: {
      icon: "💪",
      description: "A strength-focused movement used to support climbing power and durability."
    },
    Conditioning: {
      icon: "⚡",
      description: "A conditioning-focused exercise used to improve endurance and recovery."
    }
  };

  return fallbackByType[type] || {
    icon: "🏔️",
    description: "A climbing workout entry saved in your training log."
  };
}

export async function getExerciseDetails(name, type = "") {
  const preview = getExercisePreview(type, name);

  if (!preview) return null;

  return {
    target: type || "General climbing",
    equipment: "Bodyweight / gym equipment",
    gifUrl: "",
    description: preview.description,
    icon: preview.icon
  };
}