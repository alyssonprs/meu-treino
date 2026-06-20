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
  it("resolves the initial specific exercise catalog", () => {
    expect(Object.keys(visualGuidesById).sort()).toEqual([
      "barbell_bench_press",
      "barbell_biceps_curl",
      "barbell_row",
      "dumbbell_bench_press",
      "hip_thrust",
      "lat_pulldown",
      "lateral_raise",
      "leg_press",
      "plank",
      "pull_up",
      "romanian_deadlift",
      "rope_triceps_pushdown",
    ]);

    expect(visualGuidesById.barbell_row.imageUrl).toContain(
      "data:image/svg+xml",
    );
    expect(visualGuidesById.barbell_row.imageAlt).toContain("remada curvada");
    expect(visualGuidesById.plank.imageAlt).toContain("prancha");
  });

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

    expect(guide.imageUrl).toContain("data:image/svg+xml");
    expect(guide.imageAlt).toContain("supino reto");
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
    expect(guide.imageUrl).toContain("horizontal-push");
    expect(guide.executionCues).toEqual([
      "Pes firmes no chao",
      "Desca com controle",
      "Empurre sem tirar o ombro do banco",
    ]);
  });

  it("prefers known exercise mappings before generic movement guides", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      visual_id: undefined,
      movement_pattern: "horizontal_pull",
    });

    expect(guide.imageUrl).toContain("data:image/svg+xml");
    expect(guide.imageAlt).toContain("supino reto");
  });

  it("uses the initial specific catalog by known exercise id", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: "remada-curvada-barra",
      exerciseId: "remada-curvada-barra",
      name: "Remada curvada",
      muscleGroup: "Costas",
      visual_id: undefined,
      movement_pattern: "horizontal_pull",
    });

    expect(guide.imageUrl).toContain("data:image/svg+xml");
    expect(guide.imageAlt).toContain("remada curvada");
  });

  it("uses generic movement image when no specific visual is available", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: null,
      exerciseId: "remada-baixa-cabo",
      name: "Remada baixa",
      muscleGroup: "Costas",
      movement_pattern: "horizontal_pull",
    });

    expect(guide.imageUrl).toContain("horizontal-pull");
    expect(guide.imageAlt).toContain("puxar na horizontal");
  });

  it("uses second-batch generic images for real workout movement patterns", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      sourceExerciseId: null,
      exerciseId: "prancha",
      name: "Prancha",
      muscleGroup: "Abdomen",
      movement_pattern: "core_anti_extension",
    });

    expect(guide.imageUrl).toContain("core-anti-extension");
    expect(guide.imageAlt).toContain("estabilidade do core");
  });

  it("keeps muscle and note fallback when no visual metadata is available", () => {
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
