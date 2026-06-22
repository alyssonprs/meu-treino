import type {
  HealthConnectAdapter,
  HealthConnectStatus,
  HealthConnectWorkoutExport,
  HealthConnectWorkoutSegment,
} from "@/platform/health-connect";
import type { SaveCompletedWorkoutSessionInput } from "@/storage/workoutPlanRepository";

export type BuildHealthConnectWorkoutExportInput = {
  sessionId: string;
  session: SaveCompletedWorkoutSessionInput;
};

export type HealthConnectAutoExportStatus =
  | "disabled"
  | "exported"
  | "permission-missing"
  | "unavailable"
  | "failed";

export type HealthConnectAutoExportResult = {
  status: HealthConnectAutoExportStatus;
  message: string;
};

export type AutoExportCompletedWorkoutInput = {
  sessionId: string;
  session: SaveCompletedWorkoutSessionInput;
  adapter: Pick<HealthConnectAdapter, "getStatus" | "exportWorkoutSession">;
  getAutoExportEnabled: () => Promise<boolean>;
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

export async function autoExportCompletedWorkoutToHealthConnect({
  sessionId,
  session,
  adapter,
  getAutoExportEnabled,
}: AutoExportCompletedWorkoutInput): Promise<HealthConnectAutoExportResult> {
  try {
    const autoExportEnabled = await getAutoExportEnabled();

    if (!autoExportEnabled) {
      return {
        status: "disabled",
        message: "Exportacao automatica para Health Connect desativada.",
      };
    }

    const status = await adapter.getStatus();

    if (status !== "ready") {
      return toUnavailableExportResult(status);
    }

    const result = await adapter.exportWorkoutSession(
      buildHealthConnectWorkoutExport({ sessionId, session }),
    );

    if (!result.success) {
      return {
        status: "failed",
        message:
          result.message ??
          "Treino salvo localmente, mas nao foi possivel enviar ao Health Connect.",
      };
    }

    return {
      status: "exported",
      message: "Treino enviado ao Health Connect.",
    };
  } catch {
    return {
      status: "failed",
      message:
        "Treino salvo localmente, mas nao foi possivel enviar ao Health Connect.",
    };
  }
}

function buildWorkoutSegments(): HealthConnectWorkoutSegment[] {
  return [];
}

function toUnavailableExportResult(
  status: HealthConnectStatus,
): HealthConnectAutoExportResult {
  if (status === "permission-missing" || status === "available") {
    return {
      status: "permission-missing",
      message:
        "Treino salvo localmente. Conecte o Health Connect nas Configuracoes para exportar os proximos treinos.",
    };
  }

  return {
    status: "unavailable",
    message: "Treino salvo localmente. Health Connect indisponivel neste app.",
  };
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
