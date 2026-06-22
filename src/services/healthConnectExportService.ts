import type {
  HealthConnectWorkoutExport,
  HealthConnectWorkoutSegment,
} from "@/platform/health-connect";
import type { SaveCompletedWorkoutSessionInput } from "@/storage/workoutPlanRepository";

export type BuildHealthConnectWorkoutExportInput = {
  sessionId: string;
  session: SaveCompletedWorkoutSessionInput;
};

export function buildHealthConnectWorkoutExport({
  sessionId,
  session,
}: BuildHealthConnectWorkoutExportInput): HealthConnectWorkoutExport {
  const startedAt = toIsoTimestamp(session.startedAt);
  const completedAt = toIsoTimestamp(session.completedAt);
  const clientRecordVersion = new Date(completedAt).getTime();
  const segments = buildWorkoutSegments();

  return {
    sessionId,
    clientRecordId: `meu-treino:workout-session:${sessionId}`,
    clientRecordVersion,
    title: session.routineName,
    notes: segments.length > 0 ? null : buildWorkoutSummaryNotes(session),
    startedAt,
    completedAt,
    exerciseType: "weightlifting",
    segments,
  };
}

function buildWorkoutSegments(): HealthConnectWorkoutSegment[] {
  return [];
}

function buildWorkoutSummaryNotes(
  session: SaveCompletedWorkoutSessionInput,
): string {
  const exerciseLines = session.exercises
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((exercise) => {
      const setSummary = exercise.sets
        .slice()
        .sort((left, right) => left.setNumber - right.setNumber)
        .map((set) => `${set.loadKg} kg x ${set.reps} reps`)
        .join("; ");

      return `${exercise.exerciseName}: ${setSummary}`;
    });

  return [
    "Sessao registrada no Meu Treino.",
    `Rotina: ${session.routineName}.`,
    `Exercicios registrados: ${session.exercises.length}.`,
    ...exerciseLines,
  ].join("\n");
}

function toIsoTimestamp(value: string): string {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error(`Timestamp invalido para Health Connect: ${value}`);
  }

  return timestamp.toISOString();
}
