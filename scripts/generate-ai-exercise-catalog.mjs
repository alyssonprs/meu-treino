import { readFile, writeFile } from "node:fs/promises";

const INPUT_PATH = "src/config/exercise-media-library.json";
const OUTPUT_PATH = "src/assets/meu-treino-catalogo-exercicios.json";

const library = JSON.parse(await readFile(INPUT_PATH, "utf8"));

if (!Array.isArray(library.exercises)) {
  throw new Error(`${INPUT_PATH} must contain an exercises array.`);
}

const seenVisualIds = new Set();

const catalog = library.exercises.map((exercise) => {
  const visualId = normalizeRequiredString(exercise.visual_id, "visual_id");
  const name = normalizeRequiredString(exercise.source_name, "source_name");

  if (seenVisualIds.has(visualId)) {
    throw new Error(`Duplicate visual_id in ${INPUT_PATH}: ${visualId}`);
  }

  seenVisualIds.add(visualId);

  return {
    visual_id: visualId,
    name,
  };
});

await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(
  `Generated ${OUTPUT_PATH} with ${catalog.length} exercise catalog items.`,
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
