import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_REPO = "hasaneyldrm/exercises-dataset";
const SOURCE_COMMIT = "f987a7b858d7987c3677e1073ee18b623895f615";
const SOURCE_DATA_URL = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/data/exercises.json`;
const OUTPUT_PATH = "src/config/exercise-media-library.json";
const LICENSE_NOTE = "educational and non-commercial only";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outputPath = path.join(projectRoot, OUTPUT_PATH);
const exerciseGuideCatalogPath = path.join(
  projectRoot,
  "src/config/exercise-guide-catalog.json",
);

const exerciseGuideCatalog = JSON.parse(
  await readFile(exerciseGuideCatalogPath, "utf8"),
);
const supportedMovementPatterns = new Set(
  exerciseGuideCatalog.movement_patterns.map((pattern) => pattern.id),
);

const requiredStringFields = [
  "id",
  "name",
  "category",
  "body_part",
  "equipment",
  "muscle_group",
  "target",
  "image",
  "gif_url",
];

const response = await fetch(SOURCE_DATA_URL);

if (!response.ok) {
  throw new Error(
    `Failed to fetch source dataset: ${response.status} ${response.statusText}`,
  );
}

const sourceExercises = await response.json();

if (!Array.isArray(sourceExercises)) {
  throw new Error("Source dataset must be a JSON array");
}

const exercises = sourceExercises.map((exercise, index) =>
  mapExercise(exercise, index),
);

const mediaLibrary = {
  source: {
    repo: SOURCE_REPO,
    commit: SOURCE_COMMIT,
    license_note: LICENSE_NOTE,
    usage_restriction:
      "Use only for personal, educational, research, demonstration, or other strictly non-commercial contexts.",
  },
  stats: {
    exercises: exercises.length,
    images: exercises.filter((exercise) => exercise.image_asset).length,
    animations: exercises.filter((exercise) => exercise.animation_asset).length,
  },
  exercises,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(mediaLibrary, null, 2)}\n`);

console.log(
  `Generated ${OUTPUT_PATH} with ${exercises.length} exercises from ${SOURCE_REPO}@${SOURCE_COMMIT}.`,
);

function mapExercise(exercise, index) {
  validateExercise(exercise, index);

  const movementPattern = inferMovementPattern(exercise);

  if (!supportedMovementPatterns.has(movementPattern)) {
    throw new Error(
      `Unsupported movement pattern "${movementPattern}" for exercise ${exercise.id}`,
    );
  }

  return {
    visual_id: `exdb_${exercise.id}`,
    source_id: exercise.id,
    source_name: normalizeText(exercise.name),
    body_part: normalizeText(exercise.body_part),
    category: normalizeText(exercise.category),
    target: normalizeText(exercise.target),
    muscle_group: normalizeText(exercise.muscle_group),
    secondary_muscles: normalizeStringList(exercise.secondary_muscles),
    equipment: normalizeText(exercise.equipment),
    movement_pattern: movementPattern,
    image_asset: toLocalMediaPath(exercise.image, "images", ".jpg"),
    animation_asset: toLocalMediaPath(exercise.gif_url, "videos", ".gif"),
  };
}

function validateExercise(exercise, index) {
  if (!exercise || typeof exercise !== "object") {
    throw new Error(`Exercise at index ${index} must be an object`);
  }

  for (const field of requiredStringFields) {
    if (typeof exercise[field] !== "string" || !exercise[field].trim()) {
      throw new Error(`Exercise at index ${index} has invalid field "${field}"`);
    }
  }

  if (
    !Array.isArray(exercise.secondary_muscles) ||
    exercise.secondary_muscles.some((muscle) => typeof muscle !== "string")
  ) {
    throw new Error(
      `Exercise ${exercise.id} has invalid field "secondary_muscles"`,
    );
  }
}

function inferMovementPattern(exercise) {
  const name = normalizeForMatch(exercise.name);
  const bodyPart = normalizeForMatch(exercise.body_part);
  const category = normalizeForMatch(exercise.category);
  const target = normalizeForMatch(exercise.target);
  const muscleGroup = normalizeForMatch(exercise.muscle_group);
  const primaryText = [
    exercise.name,
    exercise.body_part,
    exercise.category,
    exercise.target,
    exercise.muscle_group,
    exercise.equipment,
  ]
    .map(normalizeForMatch)
    .join(" ");

  if (
    bodyPart === "lower legs" ||
    category === "lower legs" ||
    hasAny(name, ["calf", "calves"]) ||
    hasAny(target, ["calf", "calves"])
  ) {
    return "calf_raise";
  }

  if (
    target.includes("triceps") ||
    (bodyPart === "upper arms" &&
      hasAny(primaryText, ["triceps", "tricep", "extension", "pushdown"]))
  ) {
    return "elbow_extension";
  }

  if (
    target.includes("biceps") ||
    target.includes("brachialis") ||
    (bodyPart === "upper arms" && hasAny(primaryText, ["biceps", "bicep", "curl"]))
  ) {
    return "elbow_flexion";
  }

  if (
    bodyPart === "shoulders" &&
    hasAny(name, ["lateral raise", "front raise", "raise", "upright row"])
  ) {
    return "shoulder_abduction";
  }

  if (
    bodyPart === "waist" ||
    hasAny(target, ["abs", "obliques"]) ||
    hasAny(name, ["sit-up", "sit up", "crunch"])
  ) {
    return "core_flexion";
  }

  if (hasAny(name, ["plank", "rollout", "anti extension"])) {
    return "core_anti_extension";
  }

  if (hasAny(name, ["twist", "rotation", "russian"])) {
    return "core_rotation";
  }

  if (hasAny(name, ["leg curl", "hamstring curl"])) {
    return "leg_curl";
  }

  if (hasAny(name, ["leg extension"])) {
    return "leg_extension";
  }

  if (hasAny(name, ["hip thrust", "glute bridge", "bridge"])) {
    return "hip_thrust";
  }

  if (hasAny(name, ["lunge", "split squat", "step-up", "step up"])) {
    return "lunge";
  }

  if (hasAny(name, ["deadlift", "good morning", "pull-through", "pull through"])) {
    return "hinge";
  }

  if (hasAny(name, ["squat", "leg press", "hack squat"])) {
    return "squat";
  }

  if (hasAny(name, ["pull-up", "pull up", "chin-up", "chin up", "pulldown"])) {
    return "vertical_pull";
  }

  if (hasAny(name, ["shoulder press", "overhead press", "military press"])) {
    return "vertical_push";
  }

  if (hasAny(name, ["row", "rear delt", "face pull", "reverse fly"])) {
    return "horizontal_pull";
  }

  if (
    bodyPart === "chest" ||
    hasAny(name, ["press", "push-up", "push up", "fly"])
  ) {
    return "horizontal_push";
  }

  if (
    bodyPart === "back" ||
    hasAny(target, ["lats", "upper back"]) ||
    muscleGroup.includes("lats")
  ) {
    return "horizontal_pull";
  }

  if (bodyPart === "shoulders") {
    return "vertical_push";
  }

  if (bodyPart === "upper legs" || hasAny(target, ["quadriceps", "quads"])) {
    return "squat";
  }

  return "core_flexion";
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function normalizeText(value) {
  return value
    .trim()
    .replace(/(?:\u00C2\u00B0|\u0432\u00B0|\u00B0)/g, " degree")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeStringList(value) {
  return value.map(normalizeText).filter(Boolean);
}

function normalizeForMatch(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toLocalMediaPath(sourcePath, expectedDirectory, expectedExtension) {
  const normalizedPath = sourcePath.replaceAll("\\", "/").trim();

  if (
    normalizedPath.includes("://") ||
    normalizedPath.startsWith("/") ||
    normalizedPath.includes("..")
  ) {
    throw new Error(`Invalid media path: ${sourcePath}`);
  }

  const parsed = path.posix.parse(normalizedPath);

  if (
    parsed.dir !== expectedDirectory ||
    parsed.ext.toLowerCase() !== expectedExtension
  ) {
    throw new Error(`Unexpected media path: ${sourcePath}`);
  }

  return `exercise-media/${expectedDirectory}/${parsed.base}`;
}
