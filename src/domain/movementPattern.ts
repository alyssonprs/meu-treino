import exerciseMediaLibrary from "@/config/exercise-media-library.json";

type ExerciseMediaLibraryConfig = {
  exercises: {
    movement_pattern: string;
    visual_id: string;
  }[];
};

const mediaLibrary = exerciseMediaLibrary as ExerciseMediaLibraryConfig;

export const supportedMovementPatterns = Array.from(
  new Set(mediaLibrary.exercises.map((exercise) => exercise.movement_pattern)),
) as [string, ...string[]];

export const supportedVisualIds = Array.from(
  new Set(mediaLibrary.exercises.map((exercise) => exercise.visual_id)),
) as [string, ...string[]];

export const supportedVisualIdSet = new Set(supportedVisualIds);

export type MovementPattern = string;
