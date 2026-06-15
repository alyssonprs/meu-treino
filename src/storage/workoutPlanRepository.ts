import type {
  PlannedExercise,
  WorkoutPlan,
  WorkoutPlanStep,
} from "@/domain/workoutPlan";

export type WorkoutPlanRecord = {
  id: string;
  sourcePlanId: string | null;
  name: string;
  objective: string;
  level: string;
  estimatedDurationWeeks: number;
  daysPerWeek: number;
  isActive: boolean;
  importedAt: string;
};

export type RoutineRecord = {
  id: string;
  planId: string;
  sourceRoutineId: string;
  name: string;
  order: number;
};

export type RoutineStepRecord = WorkoutPlanStep & {
  id: string;
  routineId: string;
  planId: string;
  kind: "warmup" | "cooldown";
  order: number;
};

export type ExerciseRecord = {
  id: string;
  sourceExerciseId: string | null;
  canonicalKey: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  isUnilateral: boolean;
};

export type PlannedExerciseRecord = Omit<
  PlannedExercise,
  "exercise_id" | "muscle_group" | "is_unilateral"
> & {
  id: string;
  routineId: string;
  planId: string;
  exerciseId: string;
  sourceExerciseId: string | null;
  muscleGroup: string;
  isUnilateral: boolean;
  order: number;
};

export type WorkoutPlanProgressRecord = {
  planId: string;
  completedSessionsCount: number;
  lastCompletedRoutineId: string | null;
  lastCompletedRoutineOrder: number | null;
  lastCompletedAt: string | null;
};

export type WorkoutSessionRecord = {
  id: string;
  planId: string;
  routineId: string;
  routineName: string;
  routineOrder: number;
  startedAt: string;
  completedAt: string;
  status: "completed";
};

export type ExerciseLogRecord = {
  id: string;
  sessionId: string;
  planId: string;
  routineId: string;
  plannedExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
};

export type SetLogRecord = {
  id: string;
  sessionId: string;
  exerciseLogId: string;
  exerciseId: string;
  setNumber: number;
  loadKg: number;
  reps: number;
  rir: number | null;
  notes: string | null;
  completedAt: string;
};

export type ExerciseLoadHistoryRecord = {
  exerciseId: string;
  sourceExerciseId: string | null;
  exerciseName: string;
  lastLoadKg: number;
  maxLoadKg: number;
  lastReps: number;
  lastRir: number | null;
  completedSetsCount: number;
  updatedAt: string;
};

export type RoutineWithDetails = RoutineRecord & {
  warmup: RoutineStepRecord[];
  exercises: PlannedExerciseRecord[];
  cooldown: RoutineStepRecord[];
};

export type ActiveWorkoutPlanSnapshot = {
  plan: WorkoutPlanRecord;
  routines: RoutineWithDetails[];
  progress: WorkoutPlanProgressRecord;
};

export type SaveActiveWorkoutPlanInput = {
  plan: WorkoutPlan;
  importedAt?: string;
};

export type SaveActiveWorkoutPlanResult = {
  planId: string;
};

export type MarkRoutineAsCompletedInput = {
  planId: string;
  routineId: string;
  routineOrder: number;
  completedAt: string;
};

export type CompletedWorkoutExerciseInput = {
  plannedExerciseId: string;
  exerciseId: string;
  sourceExerciseId: string | null;
  exerciseName: string;
  order: number;
  sets: {
    setNumber: number;
    loadKg: number;
    reps: number;
    rir: number | null;
    notes: string | null;
  }[];
};

export type SaveCompletedWorkoutSessionInput = {
  planId: string;
  routineId: string;
  routineName: string;
  routineOrder: number;
  startedAt: string;
  completedAt: string;
  exercises: CompletedWorkoutExerciseInput[];
};

export type SaveCompletedWorkoutSessionResult = {
  sessionId: string;
};

export interface WorkoutPlanRepository {
  saveActivePlan(
    input: SaveActiveWorkoutPlanInput,
  ): Promise<SaveActiveWorkoutPlanResult>;
  getActivePlan(): Promise<ActiveWorkoutPlanSnapshot | null>;
  markRoutineAsCompleted(input: MarkRoutineAsCompletedInput): Promise<void>;
  saveCompletedWorkoutSession(
    input: SaveCompletedWorkoutSessionInput,
  ): Promise<SaveCompletedWorkoutSessionResult>;
  getExerciseLoadHistory(
    exerciseIds?: string[],
  ): Promise<ExerciseLoadHistoryRecord[]>;
  clearAllWorkoutData(): Promise<void>;
}
