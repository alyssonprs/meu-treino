import { describe, expect, it } from "vitest";

import { validateWorkoutPlanJson, workoutPlanSchema } from "./workoutPlan";

const validWorkoutPlan = {
  workout_plan: {
    plan_id: "hipertrofia-01",
    name: "Hipertrofia 4 dias",
    objective: "Ganho de massa muscular",
    level: "intermediario",
    estimated_duration_weeks: 8,
    days_per_week: 4,
    routines: [
      {
        routine_id: "treino-a",
        name: "Treino A",
        order: 1,
        warmup: [
          {
            type: "warmup",
            activity: "Esteira leve",
            duration_minutes: 8,
            notes: "Manter ritmo confortavel",
          },
        ],
        exercises: [
          {
            exercise_id: "supino-reto-barra",
            name: "Supino reto",
            muscle_group: "Peitoral",
            equipment: "Barra",
            is_unilateral: false,
            sets: 4,
            target_reps: "8-10",
            target_rir: 2,
            rest_seconds: 90,
            tempo: "2-0-1",
            advanced_technique: "Nenhuma",
            notes: "Controlar a descida",
            media_url: "https://example.com/supino-reto",
          },
        ],
        cooldown: [
          {
            type: "cooldown",
            activity: "Alongamento peitoral",
            duration_minutes: 3,
          },
        ],
      },
    ],
  },
};

describe("workoutPlanSchema", () => {
  it("accepts a valid workout plan import JSON", () => {
    const parsed = workoutPlanSchema.parse(validWorkoutPlan);

    expect(parsed.workout_plan.name).toBe("Hipertrofia 4 dias");
    expect(parsed.workout_plan.routines[0].exercises[0].sets).toBe(4);
  });

  it("returns basic validation errors for missing workout_plan root", () => {
    const result = validateWorkoutPlanJson({ routines: [] });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "workout_plan",
        }),
      ]),
    );
  });

  it("rejects routines without exercises", () => {
    const result = validateWorkoutPlanJson({
      workout_plan: {
        name: "Plano incompleto",
        objective: "Forca",
        level: "iniciante",
        estimated_duration_weeks: 6,
        days_per_week: 3,
        routines: [
          {
            routine_id: "treino-a",
            name: "Treino A",
            order: 1,
            exercises: [],
          },
        ],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        {
          path: "workout_plan.routines.0.exercises",
          message: "A rotina deve ter ao menos um exercicio",
        },
      ]),
    );
  });

  it("rejects invalid numeric workout targets", () => {
    const result = validateWorkoutPlanJson({
      workout_plan: {
        name: "Plano invalido",
        objective: "Condicionamento",
        level: "iniciante",
        estimated_duration_weeks: 0,
        days_per_week: 0,
        routines: [],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        {
          path: "workout_plan.estimated_duration_weeks",
          message: "Semanas estimadas deve ser maior que zero",
        },
        {
          path: "workout_plan.days_per_week",
          message: "Dias por semana deve ser maior que zero",
        },
        {
          path: "workout_plan.routines",
          message: "O plano deve ter ao menos uma rotina",
        },
      ]),
    );
  });
});
