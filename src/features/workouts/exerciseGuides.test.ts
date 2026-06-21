import { describe, expect, it } from "vitest";

import type { PlannedExerciseRecord } from "@/storage/workoutPlanRepository";

import { visualGuidesById } from "./exerciseGuideCatalog";
import { getExerciseGuide } from "./exerciseGuides";

const baseExercise: PlannedExerciseRecord = {
  id: "planned-1",
  routineId: "routine-1",
  planId: "plan-1",
  exerciseId: "supino-reto-barra",
  sourceExerciseId: "supino-reto-barra",
  name: "Supino reto",
  muscleGroup: "Peitoral",
  equipment: "Barra",
  isUnilateral: false,
  sets: 4,
  target_reps: "8-10",
  order: 1,
};

describe("getExerciseGuide", () => {
  it("starts without rolled-back local exercise images", () => {
    expect(Object.keys(visualGuidesById)).toEqual([]);
  });

  it("uses muscles and cues from the workout JSON without requiring an image", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      primary_muscles: ["Peitoral maior"],
      secondary_muscles: ["Triceps", "Deltoide anterior"],
      movement_pattern: "horizontal_push",
      visual_id: "barbell_bench_press",
      execution_cues: [
        "Pes firmes no chao",
        "Desca com controle",
        "Empurre sem tirar os ombros do banco",
      ],
    });

    expect(guide.imageUrl).toBeNull();
    expect(guide.imageAlt).toContain("Supino reto");
    expect(guide.primaryMuscles).toEqual(["Peitoral maior"]);
    expect(guide.secondaryMuscles).toEqual(["Triceps", "Deltoide anterior"]);
    expect(guide.executionCues).toEqual([
      "Pes firmes no chao",
      "Desca com controle",
      "Empurre sem tirar os ombros do banco",
    ]);
  });

  it("uses movement pattern only for fallback cues", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: null,
      exerciseId: "flexao|peitoral|peso corporal|bilateral",
      movement_pattern: "horizontal_push",
    });

    expect(guide.imageUrl).toBeNull();
    expect(guide.primaryMuscles).toEqual(["Peitoral"]);
    expect(guide.secondaryMuscles).toEqual([]);
    expect(guide.executionCues).toEqual([
      "Pes firmes no chao",
      "Desca com controle",
      "Empurre sem tirar o ombro do banco",
    ]);
  });

  it("does not reuse retired aliases for different exercises", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: "remada-curvada-barra",
      exerciseId: "remada-curvada-barra",
      name: "Remada curvada",
      muscleGroup: "Costas",
      visual_id: undefined,
      movement_pattern: "horizontal_pull",
    });

    expect(guide.imageUrl).toBeNull();
    expect(guide.imageAlt).toContain("Remada curvada");
    expect(guide.executionCues).toEqual([
      "Tronco firme",
      "Puxe com os cotovelos",
      "Controle a volta",
    ]);
  });

  it("keeps note fallback when no visual metadata is available", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: null,
      exerciseId: "exercicio-sem-guia",
      movement_pattern: undefined,
      notes: "Use carga leve e controle o movimento",
    });

    expect(guide.imageUrl).toBeNull();
    expect(guide.primaryMuscles).toEqual(["Peitoral"]);
    expect(guide.executionCues).toEqual([
      "Use carga leve e controle o movimento",
    ]);
  });
});
