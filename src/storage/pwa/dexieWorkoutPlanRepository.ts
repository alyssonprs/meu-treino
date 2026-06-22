import { createExerciseCanonicalKey } from "@/domain/exerciseKey";

import { MeuTreinoDatabase, workoutDatabase } from "./workoutDatabase";
import type {
  ActiveWorkoutPlanSnapshot,
  AppSettingsRecord,
  CompletedWorkoutSessionSummaryRecord,
  ExerciseLoadHistoryRecord,
  ExerciseLogRecord,
  ExerciseSetHistoryRecord,
  ExerciseRecord,
  PlannedExerciseRecord,
  RoutineRecord,
  RoutineExecutionSummaryRecord,
  RoutineStepRecord,
  MarkRoutineAsCompletedInput,
  SaveCompletedWorkoutSessionInput,
  SaveCompletedWorkoutSessionResult,
  SaveActiveWorkoutPlanInput,
  SaveActiveWorkoutPlanResult,
  SetLogRecord,
  WorkoutSessionRecord,
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
const appSettingsId: AppSettingsRecord["id"] = "app";
const appSettingsSchemaVersion = 1;

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

  async saveCompletedWorkoutSession(
    input: SaveCompletedWorkoutSessionInput,
  ): Promise<SaveCompletedWorkoutSessionResult> {
    const sessionId = this.createId();
    const session: WorkoutSessionRecord = {
      id: sessionId,
      planId: input.planId,
      routineId: input.routineId,
      routineName: input.routineName,
      routineOrder: input.routineOrder,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      status: "completed",
    };

    const exerciseLogs: ExerciseLogRecord[] = [];
    const setLogs: SetLogRecord[] = [];

    input.exercises.forEach((exercise) => {
      const exerciseLogId = this.createId();

      exerciseLogs.push({
        id: exerciseLogId,
        sessionId,
        planId: input.planId,
        routineId: input.routineId,
        plannedExerciseId: exercise.plannedExerciseId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        order: exercise.order,
      });

      exercise.sets.forEach((set) => {
        setLogs.push({
          id: this.createId(),
          sessionId,
          exerciseLogId,
          exerciseId: exercise.exerciseId,
          setNumber: set.setNumber,
          loadKg: set.loadKg,
          reps: set.reps,
          rir: set.rir,
          notes: set.notes,
          completedAt: input.completedAt,
        });
      });
    });

    await this.database.transaction(
      "rw",
      [
        this.database.workoutSessions,
        this.database.exerciseLogs,
        this.database.setLogs,
        this.database.exerciseLoadHistory,
        this.database.workoutPlanProgress,
      ],
      async () => {
        await this.database.workoutSessions.add(session);

        if (exerciseLogs.length > 0) {
          await this.database.exerciseLogs.bulkAdd(exerciseLogs);
        }

        if (setLogs.length > 0) {
          await this.database.setLogs.bulkAdd(setLogs);
        }

        await Promise.all(
          input.exercises.map((exercise) =>
            this.upsertExerciseLoadHistory(exercise, input.completedAt),
          ),
        );

        await this.markRoutineAsCompleted({
          planId: input.planId,
          routineId: input.routineId,
          routineOrder: input.routineOrder,
          completedAt: input.completedAt,
        });
      },
    );

    return { sessionId };
  }

  async getRecentCompletedWorkoutSessions(
    limit = 5,
  ): Promise<CompletedWorkoutSessionSummaryRecord[]> {
    const sessions = (await this.database.workoutSessions.toArray())
      .filter((session) => session.status === "completed")
      .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
      .slice(0, limit);

    return Promise.all(
      sessions.map(async (session) => {
        const [exerciseLogs, setLogs] = await Promise.all([
          this.database.exerciseLogs
            .where("sessionId")
            .equals(session.id)
            .toArray(),
          this.database.setLogs.where("sessionId").equals(session.id).toArray(),
        ]);

        return {
          ...session,
          exercisesCount: exerciseLogs.length,
          setsCount: setLogs.length,
        };
      }),
    );
  }

  async getRoutineExecutionSummaries(
    planId: string,
  ): Promise<RoutineExecutionSummaryRecord[]> {
    const sessions = (await this.database.workoutSessions.toArray())
      .filter(
        (session) =>
          session.planId === planId && session.status === "completed",
      )
      .sort((left, right) => right.completedAt.localeCompare(left.completedAt));

    const summariesByRoutine = new Map<string, RoutineExecutionSummaryRecord>();

    sessions.forEach((session) => {
      const current = summariesByRoutine.get(session.routineId);

      if (!current) {
        summariesByRoutine.set(session.routineId, {
          routineId: session.routineId,
          routineName: session.routineName,
          routineOrder: session.routineOrder,
          completedSessionsCount: 1,
          lastCompletedAt: session.completedAt,
        });
        return;
      }

      summariesByRoutine.set(session.routineId, {
        ...current,
        completedSessionsCount: current.completedSessionsCount + 1,
      });
    });

    return Array.from(summariesByRoutine.values()).sort(
      (left, right) => left.routineOrder - right.routineOrder,
    );
  }

  async getExerciseLoadHistory(
    exerciseIds?: string[],
  ): Promise<ExerciseLoadHistoryRecord[]> {
    if (!exerciseIds) {
      return this.database.exerciseLoadHistory.toArray();
    }

    const uniqueExerciseIds = Array.from(new Set(exerciseIds));
    const history = await Promise.all(
      uniqueExerciseIds.map((exerciseId) =>
        this.database.exerciseLoadHistory.get(exerciseId),
      ),
    );

    return history.filter((item) => item !== undefined);
  }

  async getExerciseSetHistory(
    exerciseId: string,
    limit = 20,
  ): Promise<ExerciseSetHistoryRecord[]> {
    const setLogs = (
      await this.database.setLogs.where("exerciseId").equals(exerciseId).toArray()
    )
      .sort((left, right) => {
        const dateComparison = right.completedAt.localeCompare(left.completedAt);

        return dateComparison !== 0
          ? dateComparison
          : right.setNumber - left.setNumber;
      })
      .slice(0, limit);

    return Promise.all(
      setLogs.map(async (setLog) => {
        const [session, exerciseLog] = await Promise.all([
          this.database.workoutSessions.get(setLog.sessionId),
          this.database.exerciseLogs.get(setLog.exerciseLogId),
        ]);

        return {
          id: setLog.id,
          sessionId: setLog.sessionId,
          routineName: session?.routineName ?? "Treino",
          completedAt: session?.completedAt ?? setLog.completedAt,
          exerciseId: setLog.exerciseId,
          exerciseName: exerciseLog?.exerciseName ?? "Exercicio",
          setNumber: setLog.setNumber,
          loadKg: setLog.loadKg,
          reps: setLog.reps,
          rir: setLog.rir,
          notes: setLog.notes,
        };
      }),
    );
  }

  async getHealthConnectAutoExportEnabled(): Promise<boolean> {
    const settings = await this.database.appSettings.get(appSettingsId);

    return settings?.healthConnectAutoExportEnabled ?? false;
  }

  async setHealthConnectAutoExportEnabled(enabled: boolean): Promise<void> {
    const currentSettings = await this.database.appSettings.get(appSettingsId);

    await this.database.appSettings.put({
      id: appSettingsId,
      schemaVersion: currentSettings?.schemaVersion ?? appSettingsSchemaVersion,
      healthConnectAutoExportEnabled: enabled,
      updatedAt: this.now(),
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
        this.database.workoutSessions,
        this.database.exerciseLogs,
        this.database.setLogs,
        this.database.exerciseLoadHistory,
      ],
      async () => {
        await Promise.all([
          this.database.workoutPlans.clear(),
          this.database.routines.clear(),
          this.database.routineSteps.clear(),
          this.database.exercises.clear(),
          this.database.plannedExercises.clear(),
          this.database.workoutPlanProgress.clear(),
          this.database.workoutSessions.clear(),
          this.database.exerciseLogs.clear(),
          this.database.setLogs.clear(),
          this.database.exerciseLoadHistory.clear(),
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
          primary_muscles: exercise.primary_muscles,
          secondary_muscles: exercise.secondary_muscles,
          movement_pattern: exercise.movement_pattern,
          visual_id: exercise.visual_id,
          execution_cues: exercise.execution_cues,
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

  private async upsertExerciseLoadHistory(
    exercise: SaveCompletedWorkoutSessionInput["exercises"][number],
    completedAt: string,
  ) {
    const completedSets = exercise.sets;

    if (completedSets.length === 0) {
      return;
    }

    const lastSet = completedSets[completedSets.length - 1];
    const current = await this.database.exerciseLoadHistory.get(
      exercise.exerciseId,
    );
    const maxLoadKg = Math.max(
      current?.maxLoadKg ?? 0,
      ...completedSets.map((set) => set.loadKg),
    );
    const completedSetsCount =
      (current?.completedSetsCount ?? 0) + completedSets.length;

    const nextHistory: ExerciseLoadHistoryRecord = {
      exerciseId: exercise.exerciseId,
      sourceExerciseId: exercise.sourceExerciseId,
      exerciseName: exercise.exerciseName,
      lastLoadKg: lastSet.loadKg,
      maxLoadKg,
      lastReps: lastSet.reps,
      lastRir: lastSet.rir,
      completedSetsCount,
      updatedAt: completedAt,
    };

    await this.database.exerciseLoadHistory.put(nextHistory);
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
