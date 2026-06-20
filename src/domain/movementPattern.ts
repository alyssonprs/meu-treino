export const supportedMovementPatterns = [
  "horizontal_push",
  "horizontal_pull",
  "vertical_push",
  "vertical_pull",
  "squat",
  "hinge",
  "lunge",
  "hip_thrust",
  "leg_extension",
  "leg_curl",
  "calf_raise",
  "shoulder_abduction",
  "elbow_flexion",
  "elbow_extension",
  "core_flexion",
  "core_anti_extension",
  "core_rotation",
] as const;

export type MovementPattern = (typeof supportedMovementPatterns)[number];
