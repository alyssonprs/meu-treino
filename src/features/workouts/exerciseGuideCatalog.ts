import exerciseGuideCatalog from "@/config/exercise-guide-catalog.json";
import exerciseMediaLibrary from "@/config/exercise-media-library.json";
import type { MovementPattern } from "@/domain/movementPattern";

export type VisualGuide = {
  imageUrl: string;
  animationUrl: string | null;
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

type ExerciseMediaConfig = {
  visual_id: string;
  source_id: string;
  source_name: string;
  image_asset: string;
  animation_asset: string;
};

const catalog = exerciseGuideCatalog as {
  visual_guides: VisualGuideConfig[];
  exercise_visual_aliases: ExerciseVisualAliasConfig[];
  movement_patterns: MovementPatternGuideConfig[];
};

const mediaLibrary = exerciseMediaLibrary as {
  exercises: ExerciseMediaConfig[];
};

export const visualGuidesById = Object.fromEntries(
  [
    ...mediaLibrary.exercises.map((exercise) => [
      exercise.visual_id,
      {
        imageUrl: toPublicAssetUrl(exercise.image_asset),
        animationUrl: toPublicAssetUrl(exercise.animation_asset),
        imageAlt: `Demonstracao do exercicio ${exercise.source_name}.`,
      },
    ]),
    ...catalog.visual_guides.map((guide) => [
      guide.id,
      {
        imageUrl: toPublicAssetUrl(guide.image_asset),
        animationUrl: null,
        imageAlt: guide.image_alt,
      },
    ]),
  ],
) as Record<string, VisualGuide>;

export const visualGuideIdsByExerciseId = Object.fromEntries(
  [
    ...mediaLibrary.exercises.map((exercise) => [
      exercise.source_id,
      exercise.visual_id,
    ]),
    ...catalog.exercise_visual_aliases.map((alias) => [
      alias.exercise_id,
      alias.visual_id,
    ]),
  ],
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

function toPublicAssetUrl(assetPath: string) {
  const normalizedPath = assetPath.trim().replace(/^\/+/, "");

  if (
    normalizedPath.length === 0 ||
    normalizedPath.includes("://") ||
    normalizedPath.includes("..")
  ) {
    throw new Error(`Invalid exercise media asset path: ${assetPath}`);
  }

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

  return `${baseUrl}/${normalizedPath}`;
}
