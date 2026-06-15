import { describe, expect, it, vi } from "vitest";

import {
  activateImportedWorkoutPlan,
  parseWorkoutPlanImport,
} from "./workoutImportService";

const validImportJson = JSON.stringify({
  workout_plan: {
    plan_id: "modelo",
    name: "Hipertrofia 4 dias",
    objective: "Ganho de massa",
    level: "intermediario",
    estimated_duration_weeks: 8,
    days_per_week: 4,
    routines: [
      {
        routine_id: "treino-a",
        name: "Treino A",
        order: 1,
        exercises: [
          {
            name: "Supino reto",
            muscle_group: "Peitoral",
            equipment: "Barra",
            is_unilateral: false,
            sets: 4,
            target_reps: "8-10",
          },
        ],
      },
      {
        routine_id: "treino-b",
        name: "Treino B",
        order: 2,
        exercises: [
          {
            name: "Remada curvada",
            muscle_group: "Costas",
            equipment: "Barra",
            is_unilateral: false,
            sets: 4,
            target_reps: "8-10",
          },
          {
            name: "Rosca direta",
            muscle_group: "Biceps",
            equipment: "Barra",
            is_unilateral: false,
            sets: 3,
            target_reps: "10-12",
          },
        ],
      },
    ],
  },
});

describe("workoutImportService", () => {
  it("validates imported JSON and creates a preview", () => {
    const result = parseWorkoutPlanImport(validImportJson);

    expect(result.success).toBe(true);
    expect(result.preview).toMatchObject({
      name: "Hipertrofia 4 dias",
      estimatedDurationWeeks: 8,
      daysPerWeek: 4,
      routineCount: 2,
      exerciseCount: 3,
    });
  });

  it("returns a readable error when the file is not JSON", () => {
    const result = parseWorkoutPlanImport("{invalid");

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      {
        path: "arquivo",
        message: "O arquivo precisa ser um JSON valido",
      },
    ]);
  });

  it("activates the validated plan through the repository interface", async () => {
    const parsed = parseWorkoutPlanImport(validImportJson);

    if (!parsed.success) {
      throw new Error("Fixture should be valid");
    }

    const repository = {
      saveActivePlan: vi.fn().mockResolvedValue({ planId: "plan-1" }),
      getActivePlan: vi.fn(),
      markRoutineAsCompleted: vi.fn(),
      saveCompletedWorkoutSession: vi.fn(),
      getExerciseLoadHistory: vi.fn(),
      clearAllWorkoutData: vi.fn(),
    };

    await expect(
      activateImportedWorkoutPlan({
        preview: parsed.preview,
        repository,
      }),
    ).resolves.toEqual({ planId: "plan-1" });
    expect(repository.saveActivePlan).toHaveBeenCalledWith({
      plan: parsed.preview.plan,
    });
  });
});
