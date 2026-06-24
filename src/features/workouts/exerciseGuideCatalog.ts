import exerciseMediaLibrary from "@/config/exercise-media-library.json";

export type VisualGuide = {
  imageUrl: string;
  animationUrl: string | null;
  imageAlt: string;
};

type ExerciseMediaConfig = {
  visual_id: string;
  source_id: string;
  source_name: string;
  image_asset: string;
  animation_asset: string;
};

const mediaLibrary = exerciseMediaLibrary as {
  exercises: ExerciseMediaConfig[];
};

export const visualGuidesById = Object.fromEntries(
  mediaLibrary.exercises.map((exercise) => [
    exercise.visual_id,
    {
      imageUrl: toPublicAssetUrl(exercise.image_asset),
      animationUrl: toPublicAssetUrl(exercise.animation_asset),
      imageAlt: `Demonstracao do exercicio ${exercise.source_name}.`,
    },
  ]),
) as Record<string, VisualGuide>;

export const visualGuideIdsByExerciseId = Object.fromEntries(
  mediaLibrary.exercises.map((exercise) => [
    exercise.source_id,
    exercise.visual_id,
  ]),
) as Record<string, string>;

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
  const publicBaseUrl = baseUrl === "" ? "." : baseUrl;

  return `${publicBaseUrl}/${normalizedPath}`;
}
