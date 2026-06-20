import { describe, expect, it } from "vitest";

import type { PlannedExerciseRecord } from "@/storage/workoutPlanRepository";

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
  it("uses visual metadata and cues from the workout JSON", () => {
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

    expect(guide.imageUrl).toContain("barbell-bench-press");
    expect(guide.primaryMuscles).toEqual(["Peitoral maior"]);
    expect(guide.secondaryMuscles).toEqual(["Triceps", "Deltoide anterior"]);
    expect(guide.executionCues).toEqual([
      "Pes firmes no chao",
      "Desca com controle",
      "Empurre sem tirar os ombros do banco",
    ]);
  });

  it("falls back to muscle group and movement cues for older JSON", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: null,
      exerciseId: "flexao|peitoral|peso corporal|bilateral",
      movement_pattern: "horizontal_push",
    });

    expect(guide.primaryMuscles).toEqual(["Peitoral"]);
    expect(guide.secondaryMuscles).toEqual([]);
    expect(guide.executionCues).toEqual([
      "Pes firmes no chao",
      "Desca com controle",
      "Empurre sem tirar o ombro do banco",
    ]);
  });
});
