import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INPUT_PATH = "src/config/exercise-media-library.json";
const PUBLIC_ROOT = "public";
const CONCURRENCY = 16;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const inputPath = path.join(projectRoot, INPUT_PATH);
const library = JSON.parse(await readFile(inputPath, "utf8"));

const source = library.source ?? {};
const sourceRepo = normalizeRequiredString(source.repo, "source.repo");
const sourceCommit = normalizeRequiredString(source.commit, "source.commit");
const rawBaseUrl = `https://raw.githubusercontent.com/${sourceRepo}/${sourceCommit}`;

if (!Array.isArray(library.exercises)) {
  throw new Error(`${INPUT_PATH} must contain an exercises array.`);
}

const assets = collectAssets(library.exercises);
let downloaded = 0;
let skipped = 0;

await runPool(assets, async (asset) => {
  const targetPath = path.join(projectRoot, PUBLIC_ROOT, asset.localPath);

  if (await hasExistingFile(targetPath)) {
    skipped += 1;
    return;
  }

  const response = await fetch(`${rawBaseUrl}/${asset.sourcePath}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${asset.sourcePath}: ${response.status} ${response.statusText}`,
    );
  }

  const body = Buffer.from(await response.arrayBuffer());

  if (body.length === 0) {
    throw new Error(`Fetched empty asset: ${asset.sourcePath}`);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, body);
  downloaded += 1;
});

console.log(
  `Synced ${assets.length} exercise media assets: ${downloaded} downloaded, ${skipped} already present.`,
);

function collectAssets(exercises) {
  const assetsByPath = new Map();

  for (const exercise of exercises) {
    addAsset(assetsByPath, exercise.image_asset, "images", ".jpg");
    addAsset(assetsByPath, exercise.animation_asset, "videos", ".gif");
  }

  return Array.from(assetsByPath.values());
}

function addAsset(assetsByPath, localPath, directory, extension) {
  const normalizedPath = validateLocalMediaPath(localPath, directory, extension);
  const fileName = path.posix.basename(normalizedPath);
  const sourcePath = `${directory}/${fileName}`;

  assetsByPath.set(normalizedPath, {
    localPath: normalizedPath,
    sourcePath,
  });
}

function validateLocalMediaPath(value, directory, extension) {
  const localPath = normalizeRequiredString(value, "asset path").replaceAll(
    "\\",
    "/",
  );
  const expectedPrefix = `exercise-media/${directory}/`;

  if (
    localPath.includes("://") ||
    localPath.includes("..") ||
    localPath.startsWith("/") ||
    !localPath.startsWith(expectedPrefix) ||
    path.posix.extname(localPath).toLowerCase() !== extension
  ) {
    throw new Error(`Invalid local media path: ${value}`);
  }

  return localPath;
}

async function hasExistingFile(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() && fileStat.size > 0;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function runPool(items, worker) {
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }),
  );
}

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
