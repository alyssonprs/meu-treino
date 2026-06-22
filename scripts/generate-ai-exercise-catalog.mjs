import { readFile, writeFile } from "node:fs/promises";

const INPUT_PATH = "src/config/exercise-media-library.json";
const OUTPUT_PATH = "src/assets/meu-treino-catalogo-exercicios.json";
const PUBLIC_OUTPUT_PATH = "public/meu-treino-catalogo-exercicios.json";

const library = JSON.parse(await readFile(INPUT_PATH, "utf8"));

if (!Array.isArray(library.exercises)) {
  throw new Error(`${INPUT_PATH} must contain an exercises array.`);
}

const seenVisualIds = new Set();

const catalog = library.exercises.map((exercise) => {
  const visualId = normalizeRequiredString(exercise.visual_id, "visual_id");
  const name = normalizeRequiredString(exercise.source_name, "source_name");
  const equipment = normalizeRequiredString(exercise.equipment, "equipment");
  const bodyPart = normalizeRequiredString(exercise.body_part, "body_part");
  const target = normalizeRequiredString(exercise.target, "target");
  const secondaryMuscles = normalizeStringArray(
    exercise.secondary_muscles,
    "secondary_muscles",
  );
  const movementPattern = normalizeRequiredString(
    exercise.movement_pattern,
    "movement_pattern",
  );

  if (seenVisualIds.has(visualId)) {
    throw new Error(`Duplicate visual_id in ${INPUT_PATH}: ${visualId}`);
  }

  seenVisualIds.add(visualId);

  return {
    visual_id: visualId,
    name,
    equipment,
    body_part: bodyPart,
    target,
    secondary_muscles: secondaryMuscles,
    movement_pattern: movementPattern,
  };
});

const catalogJson = `${JSON.stringify(catalog, null, 2)}\n`;

await Promise.all([
  writeFile(OUTPUT_PATH, catalogJson),
  writeFile(PUBLIC_OUTPUT_PATH, catalogJson),
]);

console.log(
  `Generated ${OUTPUT_PATH} and ${PUBLIC_OUTPUT_PATH} with ${catalog.length} exercise catalog items.`,
);

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== "string") {
    throw new Error(`Expected ${fieldName} to be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`Expected ${fieldName} to be non-empty.`);
  }

  return normalized;
}

function normalizeStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${fieldName} to be an array.`);
  }

  return value
    .map((item) => normalizeRequiredString(item, fieldName))
    .filter((item, index, items) => items.indexOf(item) === index);
}
