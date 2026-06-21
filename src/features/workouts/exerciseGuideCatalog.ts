import exerciseGuideCatalog from "@/config/exercise-guide-catalog.json";
import type { MovementPattern } from "@/domain/movementPattern";

export type VisualGuide = {
  imageUrl: string;
  imageAlt: string;
};

type VisualGuideConfig = {
  id: string;
  image_asset: string;
  image_alt: string;
};

type ExerciseVisualAliasConfig = {
  exercise_id: string;
  visual_id: string;
};

type MovementPatternGuideConfig = {
  id: string;
  default_cues: string[];
};

const catalog = exerciseGuideCatalog as {
  visual_guides: VisualGuideConfig[];
  exercise_visual_aliases: ExerciseVisualAliasConfig[];
  movement_patterns: MovementPatternGuideConfig[];
};

const exerciseGuideAssets = import.meta.glob<string>(
  "../../assets/exercise-guides/**/*",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

export const visualGuidesById = Object.fromEntries(
  catalog.visual_guides.map((guide) => [
    guide.id,
    {
      imageUrl: resolveExerciseGuideAsset(guide.image_asset),
      imageAlt: guide.image_alt,
    },
  ]),
) as Record<string, VisualGuide>;

export const visualGuideIdsByExerciseId = Object.fromEntries(
  catalog.exercise_visual_aliases.map((alias) => [
    alias.exercise_id,
    alias.visual_id,
  ]),
) as Record<string, string>;

export const movementPatternGuidesById = Object.fromEntries(
  catalog.movement_patterns.map((pattern) => [
    pattern.id,
    pattern,
  ]),
) as Record<MovementPattern, MovementPatternGuideConfig>;

export const defaultCuesByMovementPattern = Object.fromEntries(
  catalog.movement_patterns.map((pattern) => [
    pattern.id,
    pattern.default_cues,
  ]),
) as Record<MovementPattern, string[]>;

function resolveExerciseGuideAsset(fileName: string) {
  const assetPath = `../../assets/exercise-guides/${fileName}`;
  const assetUrl = exerciseGuideAssets[assetPath];

  if (!assetUrl) {
    throw new Error(`Exercise guide asset not found: ${fileName}`);
  }

  return assetUrl;
}
