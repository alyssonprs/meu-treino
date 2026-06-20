import exerciseGuideCatalog from "@/config/exercise-guide-catalog.json";
import type { MovementPattern } from "@/domain/movementPattern";

export type VisualGuide = {
  imageUrl: string;
  imageAlt: string;
};

type MovementPatternGuideConfig = {
  id: string;
  image_alt: string;
  default_cues: string[];
  arrow_paths: string[];
};

const exerciseGuideAssets = import.meta.glob<string>(
  "../../assets/exercise-guides/*",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

export const visualGuidesById = Object.fromEntries(
  exerciseGuideCatalog.visual_guides.map((guide) => [
    guide.id,
    {
      imageUrl: resolveExerciseGuideAsset(guide.image_asset),
      imageAlt: guide.image_alt,
    },
  ]),
) as Record<string, VisualGuide>;

export const visualGuideIdsByExerciseId = Object.fromEntries(
  exerciseGuideCatalog.exercise_visual_aliases.map((alias) => [
    alias.exercise_id,
    alias.visual_id,
  ]),
) as Record<string, string>;

export const movementPatternGuidesById = Object.fromEntries(
  exerciseGuideCatalog.movement_patterns.map((pattern) => [
    pattern.id,
    pattern,
  ]),
) as Record<MovementPattern, MovementPatternGuideConfig>;

export const defaultCuesByMovementPattern = Object.fromEntries(
  exerciseGuideCatalog.movement_patterns.map((pattern) => [
    pattern.id,
    pattern.default_cues,
  ]),
) as Record<MovementPattern, string[]>;

export const genericVisualGuidesByMovementPattern = Object.fromEntries(
  exerciseGuideCatalog.movement_patterns.map((pattern) => [
    pattern.id,
    createGenericMovementGuide(pattern),
  ]),
) as Record<MovementPattern, VisualGuide>;

function createGenericMovementGuide(
  pattern: MovementPatternGuideConfig,
): VisualGuide {
  return {
    imageUrl: createGenericMovementSvgUrl(pattern),
    imageAlt: pattern.image_alt,
  };
}

function createGenericMovementSvgUrl(pattern: MovementPatternGuideConfig) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">
  <defs>
    <marker id="arrow-${pattern.id}" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
      <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8"/>
    </marker>
  </defs>
  <rect width="640" height="360" rx="32" fill="#101827"/>
  <circle cx="320" cy="82" r="28" fill="#d9f99d"/>
  <path d="M320 112 L320 218" stroke="#d9f99d" stroke-width="28" stroke-linecap="round"/>
  <path d="M248 156 L392 156" stroke="#7dd3fc" stroke-width="24" stroke-linecap="round"/>
  <path d="M290 218 L246 296" stroke="#a7f3d0" stroke-width="24" stroke-linecap="round"/>
  <path d="M350 218 L394 296" stroke="#a7f3d0" stroke-width="24" stroke-linecap="round"/>
  ${getArrowMarkup(pattern)}
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getArrowMarkup(pattern: MovementPatternGuideConfig) {
  const arrowClass =
    'stroke="#38bdf8" stroke-width="18" stroke-linecap="round" fill="none" marker-end=';

  return pattern.arrow_paths
    .map((path) => `<path d="${path}" ${arrowClass}"url(#arrow-${pattern.id})"/>`)
    .join("");
}

function resolveExerciseGuideAsset(fileName: string) {
  const assetPath = `../../assets/exercise-guides/${fileName}`;
  const assetUrl = exerciseGuideAssets[assetPath];

  if (!assetUrl) {
    throw new Error(`Exercise guide asset not found: ${fileName}`);
  }

  return assetUrl;
}
