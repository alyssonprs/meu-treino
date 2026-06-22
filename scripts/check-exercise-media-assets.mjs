import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INPUT_PATH = "src/config/exercise-media-library.json";
const PUBLIC_ROOT = "public";
const REMOTE_PATTERN = /https?:\/\/|github\.com|raw\.githubusercontent\.com/i;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const inputPath = path.join(projectRoot, INPUT_PATH);
const rawCatalog = await readFile(inputPath, "utf8");

if (REMOTE_PATTERN.test(rawCatalog)) {
  throw new Error(`${INPUT_PATH} contains a remote media reference.`);
}

const library = JSON.parse(rawCatalog);

if (!Array.isArray(library.exercises)) {
  throw new Error(`${INPUT_PATH} must contain an exercises array.`);
}

const assets = collectAssets(library.exercises);
const missingAssets = [];

for (const assetPath of assets) {
  const absolutePath = path.join(projectRoot, PUBLIC_ROOT, assetPath);

  try {
    const assetStat = await stat(absolutePath);

    if (!assetStat.isFile() || assetStat.size === 0) {
      missingAssets.push(assetPath);
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      missingAssets.push(assetPath);
      continue;
    }

    throw error;
  }
}

if (missingAssets.length > 0) {
  throw new Error(
    `Missing ${missingAssets.length} exercise media assets:\n${missingAssets
      .slice(0, 20)
      .join("\n")}`,
  );
}

console.log(`Checked ${assets.length} exercise media assets.`);

function collectAssets(exercises) {
  const assets = new Set();

  for (const exercise of exercises) {
    assets.add(validateLocalMediaPath(exercise.image_asset, "images", ".jpg"));
    assets.add(validateLocalMediaPath(exercise.animation_asset, "videos", ".gif"));
  }

  return Array.from(assets);
}

function validateLocalMediaPath(value, directory, extension) {
  if (typeof value !== "string") {
    throw new Error(`Expected asset path to be a string.`);
  }

  const assetPath = value.trim().replaceAll("\\", "/");
  const expectedPrefix = `exercise-media/${directory}/`;

  if (
    REMOTE_PATTERN.test(assetPath) ||
    assetPath.includes("..") ||
    assetPath.startsWith("/") ||
    !assetPath.startsWith(expectedPrefix) ||
    path.posix.extname(assetPath).toLowerCase() !== extension
  ) {
    throw new Error(`Invalid local media path: ${value}`);
  }

  return assetPath;
}
