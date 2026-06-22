import { describe, expect, it } from "vitest";

import aiExerciseCatalog from "@/assets/meu-treino-catalogo-exercicios.json";
import exerciseMediaLibrary from "@/config/exercise-media-library.json";
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
  it("maps every media-library exercise to a local visual guide", () => {
    expect(Object.keys(visualGuidesById)).toHaveLength(
      exerciseMediaLibrary.exercises.length,
    );

    const firstExercise = exerciseMediaLibrary.exercises[0];
    const visualGuide = visualGuidesById[firstExercise.visual_id];

    expect(visualGuide.imageUrl).toBe(`/${firstExercise.image_asset}`);
    expect(visualGuide.animationUrl).toBe(`/${firstExercise.animation_asset}`);
    expect(visualGuide.imageUrl).not.toMatch(/https?:\/\//);
    expect(visualGuide.animationUrl).not.toMatch(/https?:\/\//);
  });

  it("uses a known visual_id to resolve local image and animation assets", () => {
    const guide = getExerciseGuide({
      ...baseExercise,
      visual_id: "exdb_0001",
    });

    expect(guide.imageUrl).toBe("/exercise-media/images/0001-2gPfomN.jpg");
    expect(guide.animationUrl).toBe("/exercise-media/videos/0001-2gPfomN.gif");
    expect(guide.imageAlt).toContain("3/4 sit-up");
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
    expect(guide.animationUrl).toBeNull();
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
    expect(guide.animationUrl).toBeNull();
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
    expect(guide.animationUrl).toBeNull();
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
    expect(guide.animationUrl).toBeNull();
    expect(guide.primaryMuscles).toEqual(["Peitoral"]);
    expect(guide.executionCues).toEqual([
      "Use carga leve e controle o movimento",
    ]);
  });
});

describe("AI exercise catalog", () => {
  it("summarizes every media-library exercise without leaking asset paths", () => {
    const libraryVisualIds = new Set(
      exerciseMediaLibrary.exercises.map((exercise) => exercise.visual_id),
    );

    expect(aiExerciseCatalog).toHaveLength(exerciseMediaLibrary.exercises.length);

    for (const item of aiExerciseCatalog) {
      expect(Object.keys(item).sort()).toEqual([
        "body_part",
        "equipment",
        "movement_pattern",
        "name",
        "secondary_muscles",
        "target",
        "visual_id",
      ]);
      expect(libraryVisualIds.has(item.visual_id)).toBe(true);
      expect(item.visual_id).toMatch(/^exdb_\d+$/);
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(item.equipment.trim().length).toBeGreaterThan(0);
      expect(item.body_part.trim().length).toBeGreaterThan(0);
      expect(item.target.trim().length).toBeGreaterThan(0);
      expect(item.movement_pattern.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(item.secondary_muscles)).toBe(true);
      expect(JSON.stringify(item)).not.toMatch(
        /https?:\/\/|github\.com|raw\.githubusercontent\.com|exercise-media\/|\.gif|\.jpg/i,
      );
    }
  });
});
