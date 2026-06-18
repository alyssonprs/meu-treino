import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck2,
  ChevronRight,
  Dumbbell,
  History,
  LineChart,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatLoad,
  formatShortDate,
} from "@/features/workouts/workoutFormatters";
import type {
  CompletedWorkoutSessionSummary,
  CycleProgressSummary,
  ExerciseHistoryDetails,
  ExerciseLoadSummary,
} from "@/services/progressService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

type ProgressScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  cycleProgress: CycleProgressSummary | null;
  loadSummaries: ExerciseLoadSummary[];
  recentSessions: CompletedWorkoutSessionSummary[];
  onLoadExerciseHistory: (
    exerciseId: string,
  ) => Promise<ExerciseHistoryDetails | null>;
};

export function ProgressScreen({
  activePlan,
  cycleProgress,
  loadSummaries,
  recentSessions,
  onLoadExerciseHistory,
}: ProgressScreenProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [exerciseDetails, setExerciseDetails] =
    useState<ExerciseHistoryDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!selectedExerciseId) {
      setExerciseDetails(null);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingDetails(true);
    onLoadExerciseHistory(selectedExerciseId)
      .then((details) => {
        if (isMounted) {
          setExerciseDetails(details);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onLoadExerciseHistory, selectedExerciseId]);

  if (selectedExerciseId) {
    return (
      <ExerciseHistoryScreen
        details={exerciseDetails}
        isLoading={isLoadingDetails}
        onBack={() => setSelectedExerciseId(null)}
      />
    );
  }

  if (!activePlan) {
    return <EmptyHistoryScreen />;
  }

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <History className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-info">Historico</p>
            <h2 className="text-2xl font-semibold">Seu progresso</h2>
          </div>
        </div>

        {cycleProgress ? (
          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm text-muted-foreground">Ciclo atual</p>
              <p className="text-lg font-semibold">
                {cycleProgress.completedSessions} de{" "}
                {cycleProgress.plannedSessions}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${cycleProgress.percentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {cycleProgress.isComplete
                ? "Ciclo concluido. Gere um novo plano quando quiser trocar."
                : `${cycleProgress.remainingSessions} treinos restantes neste ciclo.`}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <HistoryMetric
          icon={CalendarCheck2}
          label="Treinos"
          value={String(cycleProgress?.completedSessions ?? 0)}
        />
        <HistoryMetric
          icon={TrendingUp}
          label="Exercicios"
          value={String(loadSummaries.length)}
        />
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Evolucao de carga</p>
            <h3 className="font-semibold">Exercicios registrados</h3>
          </div>
        </div>

        {loadSummaries.length === 0 ? (
          <p className="mt-4 rounded-md bg-muted p-3 text-sm leading-6 text-muted-foreground">
            Finalize um treino para ver cargas e abrir o detalhe por exercicio.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {loadSummaries.map((summary) => (
              <button
                className="w-full rounded-md bg-muted p-3 text-left"
                key={summary.exerciseId}
                onClick={() => setSelectedExerciseId(summary.exerciseId)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">
                      {summary.exerciseName}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Atualizado em {formatShortDate(summary.updatedAt)}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Ultima: </span>
                    <span className="font-semibold">
                      {formatLoad(summary.lastLoadKg)} kg x {summary.lastReps}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Maior: </span>
                    <span className="font-semibold">
                      {formatLoad(summary.maxLoadKg)} kg
                    </span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Ultimos treinos</p>
            <h3 className="font-semibold">Sessoes concluidas</h3>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <p className="mt-4 rounded-md bg-muted p-3 text-sm leading-6 text-muted-foreground">
            Nenhuma sessao finalizada ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentSessions.map((session) => (
              <article className="rounded-md bg-muted p-3" key={session.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">
                      {session.routineName}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatShortDate(session.completedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-card px-2 py-1 text-xs font-semibold">
                    {session.setsCount} series
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {session.exercisesCount} exercicios registrados
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function ExerciseHistoryScreen({
  details,
  isLoading,
  onBack,
}: {
  details: ExerciseHistoryDetails | null;
  isLoading: boolean;
  onBack: () => void;
}) {
  return (
    <section className="mt-6 space-y-5">
      <Button className="gap-2" onClick={onBack} type="button" variant="ghost">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Button>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-info">Detalhe do exercicio</p>
        <h2 className="mt-2 text-2xl font-semibold">
          {details?.exerciseName ?? "Carregando"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Ultima carga, maior carga e series recentes salvas neste dispositivo.
        </p>
      </div>

      {isLoading || !details ? (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Carregando historico do exercicio.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <HistoryMetric
              icon={TrendingUp}
              label="Ultima carga"
              value={`${formatLoad(details.lastLoadKg)} kg`}
            />
            <HistoryMetric
              icon={LineChart}
              label="Maior carga"
              value={`${formatLoad(details.maxLoadKg)} kg`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <HistoryMetric
              icon={Dumbbell}
              label="Ultimas reps"
              value={String(details.lastReps)}
            />
            <HistoryMetric
              icon={CalendarCheck2}
              label="Series"
              value={String(details.completedSetsCount)}
            />
          </div>

          <section className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold">Registros recentes</h3>
            {details.records.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nenhuma serie encontrada para este exercicio.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {details.records.map((record) => (
                  <article className="rounded-md bg-muted p-3" key={record.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold">
                          {record.routineName}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatShortDate(record.completedAt)} - serie{" "}
                          {record.setNumber}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatLoad(record.loadKg)} kg
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {record.reps} reps
                      {record.rir === null ? "" : ` - RIR ${record.rir}`}
                    </p>
                    {record.notes ? (
                      <p className="mt-2 text-sm leading-6">{record.notes}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function EmptyHistoryScreen() {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <History className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info">Historico</p>
          <h2 className="text-2xl font-semibold">Sem treino ativo</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Importe um plano e finalize uma sessao para acompanhar suas cargas.
      </p>
    </section>
  );
}

function HistoryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-info" aria-hidden="true" />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
