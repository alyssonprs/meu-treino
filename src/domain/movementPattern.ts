import exerciseGuideCatalog from "@/config/exercise-guide-catalog.json";

export const supportedMovementPatterns =
  exerciseGuideCatalog.movement_patterns.map((pattern) => pattern.id) as [
    string,
    ...string[],
  ];

export type MovementPattern = string;
