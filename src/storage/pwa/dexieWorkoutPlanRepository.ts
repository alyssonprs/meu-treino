import { createExerciseCanonicalKey } from "@/domain/exerciseKey";

import { MeuTreinoDatabase, workoutDatabase } from "./workoutDatabase";
import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseRecord,
  PlannedExerciseRecord,
  RoutineRecord,
  RoutineStepRecord,
  MarkRoutineAsCompletedInput,
  SaveActiveWorkoutPlanInput,
  SaveActiveWorkoutPlanResult,
  WorkoutPlanProgressRecord,
  WorkoutPlanRecord,
  WorkoutPlanRepository,
} from "../workoutPlanRepository";

type DexieWorkoutPlanRepositoryOptions = {
  database?: MeuTreinoDatabase;
  createId?: () => string;
  now?: () => string;
};

const defaultCreateId = () => crypto.randomUUID();
const defaultNow = () => new Date().toISOString();

export class DexieWorkoutPlanRepository implements WorkoutPlanRepository {
  private readonly database: MeuTreinoDatabase;
  private readonly createId: () => string;
  private readonly now: () => string;

  constructor(options: DexieWorkoutPlanRepositoryOptions = {}) {
    this.database = options.database ?? workoutDatabase;
    this.createId = options.createId ?? defaultCreateId;
    this.now = options.now ?? defaultNow;
  }

  async saveActivePlan(
    input: SaveActiveWorkoutPlanInput,
  ): Promise<SaveActiveWorkoutPlanResult> {
    const planId = this.createId();
    const importedAt = input.importedAt ?? this.now();
    const records = this.createRecords(planId, input.plan, importedAt);

    await this.database.transaction(
      "rw",
      [
        this.database.workoutPlans,
        this.database.routines,
        this.database.routineSteps,
        this.database.exercises,
        this.database.plannedExercises,
        this.database.workoutPlanProgress,
      ],
      async () => {
        const activePlans = (await this.database.workoutPlans.toArray()).filter(
          (plan) => plan.isActive,
        );

        await Promise.all(
          activePlans.map((activePlan) =>
            this.database.workoutPlans.update(activePlan.id, {
              isActive: false,
            }),
          ),
        );

        await this.database.workoutPlans.add(records.plan);
        await this.database.routines.bulkAdd(records.routines);
        await this.database.routineSteps.bulkAdd(records.steps);
        await this.database.exercises.bulkPut(records.exercises);
        await this.database.plannedExercises.bulkAdd(records.plannedExercises);
        await this.database.workoutPlanProgress.add(records.progress);
      },
    );

    return { planId };
  }

  async getActivePlan(): Promise<ActiveWorkoutPlanSnapshot | null> {
    const plan = (await this.database.workoutPlans.toArray()).find(
      (workoutPlan) => workoutPlan.isActive,
    );

    if (!plan) {
      return null;
    }

    const [routines, steps, exercises, progress] = await Promise.all([
      this.database.routines.where("planId").equals(plan.id).sortBy("order"),
      this.database.routineSteps.where("planId").equals(plan.id).toArray(),
      this.database.plannedExercises.where("planId").equals(plan.id).toArray(),
      this.database.workoutPlanProgress.get(plan.id),
    ]);

    const routinesWithDetails = routines.map((routine) => {
      const sortByOrder = <T extends { order: number }>(items: T[]) =>
        [...items].sort((left, right) => left.order - right.order);

      return {
        ...routine,
        warmup: sortByOrder(
          steps.filter(
            (step) => step.routineId === routine.id && step.kind === "warmup",
          ),
        ),
        exercises: sortByOrder(
          exercises.filter((exercise) => exercise.routineId === routine.id),
        ),
        cooldown: sortByOrder(
          steps.filter(
            (step) => step.routineId === routine.id && step.kind === "cooldown",
          ),
        ),
      };
    });

    return {
      plan,
      routines: routinesWithDetails,
      progress:
        progress ??
        createInitialProgress({
          planId: plan.id,
        }),
    };
  }

  async markRoutineAsCompleted(
    input: MarkRoutineAsCompletedInput,
  ): Promise<void> {
    const currentProgress =
      (await this.database.workoutPlanProgress.get(input.planId)) ??
      createInitialProgress({ planId: input.planId });

    await this.database.workoutPlanProgress.put({
      planId: input.planId,
      completedSessionsCount: currentProgress.completedSessionsCount + 1,
      lastCompletedRoutineId: input.routineId,
      lastCompletedRoutineOrder: input.routineOrder,
      lastCompletedAt: input.completedAt,
    });
  }

  async clearAllWorkoutData(): Promise<void> {
    await this.database.transaction(
      "rw",
      [
        this.database.workoutPlans,
        this.database.routines,
        this.database.routineSteps,
        this.database.exercises,
        this.database.plannedExercises,
        this.database.workoutPlanProgress,
      ],
      async () => {
        await Promise.all([
          this.database.workoutPlans.clear(),
          this.database.routines.clear(),
          this.database.routineSteps.clear(),
          this.database.exercises.clear(),
          this.database.plannedExercises.clear(),
          this.database.workoutPlanProgress.clear(),
        ]);
      },
    );
  }

  private createRecords(
    planId: string,
    plan: SaveActiveWorkoutPlanInput["plan"],
    importedAt: string,
  ) {
    const workoutPlan: WorkoutPlanRecord = {
      id: planId,
      sourcePlanId: plan.plan_id ?? null,
      name: plan.name,
      objective: plan.objective,
      level: plan.level,
      estimatedDurationWeeks: plan.estimated_duration_weeks,
      daysPerWeek: plan.days_per_week,
      isActive: true,
      importedAt,
    };

    const routines: RoutineRecord[] = [];
    const steps: RoutineStepRecord[] = [];
    const exercises = new Map<string, ExerciseRecord>();
    const plannedExercises: PlannedExerciseRecord[] = [];

    plan.routines.forEach((routine) => {
      const routineId = this.createId();

      routines.push({
        id: routineId,
        planId,
        sourceRoutineId: routine.routine_id,
        name: routine.name,
        order: routine.order,
      });

      routine.warmup.forEach((step, stepIndex) => {
        steps.push({
          ...step,
          id: this.createId(),
          planId,
          routineId,
          kind: "warmup",
          order: stepIndex + 1,
        });
      });

      routine.exercises.forEach((exercise, exerciseIndex) => {
        const canonicalKey = createExerciseCanonicalKey(exercise);
        const exerciseId = exercise.exercise_id ?? canonicalKey;

        exercises.set(exerciseId, {
          id: exerciseId,
          sourceExerciseId: exercise.exercise_id ?? null,
          canonicalKey,
          name: exercise.name,
          muscleGroup: exercise.muscle_group,
          equipment: exercise.equipment,
          isUnilateral: exercise.is_unilateral,
        });

        plannedExercises.push({
          id: this.createId(),
          planId,
          routineId,
          exerciseId,
          sourceExerciseId: exercise.exercise_id ?? null,
          name: exercise.name,
          muscleGroup: exercise.muscle_group,
          equipment: exercise.equipment,
          isUnilateral: exercise.is_unilateral,
          sets: exercise.sets,
          target_reps: exercise.target_reps,
          target_rir: exercise.target_rir,
          rest_seconds: exercise.rest_seconds,
          tempo: exercise.tempo,
          advanced_technique: exercise.advanced_technique,
          notes: exercise.notes,
          media_url: exercise.media_url,
          order: exerciseIndex + 1,
        });
      });

      routine.cooldown.forEach((step, stepIndex) => {
        steps.push({
          ...step,
          id: this.createId(),
          planId,
          routineId,
          kind: "cooldown",
          order: stepIndex + 1,
        });
      });
    });

    return {
      plan: workoutPlan,
      routines,
      steps,
      exercises: Array.from(exercises.values()),
      plannedExercises,
      progress: createInitialProgress({ planId }),
    };
  }
}

function createInitialProgress({
  planId,
}: {
  planId: string;
}): WorkoutPlanProgressRecord {
  return {
    planId,
    completedSessionsCount: 0,
    lastCompletedRoutineId: null,
    lastCompletedRoutineOrder: null,
    lastCompletedAt: null,
  };
}

export const pwaWorkoutPlanRepository = new DexieWorkoutPlanRepository();
