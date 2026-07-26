import {
  CalendarCheck2,
  ChevronRight,
  Dumbbell,
  History,
  LineChart,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { LinearProgress } from "@/components/ui/progress";
import {
  ListSurface,
  listItemClassName,
  listRowClassName,
} from "@/components/ui/list";
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
  onOpenExerciseHistory: (exerciseId: string) => void;
};

export function ProgressScreen({
  activePlan,
  cycleProgress,
  loadSummaries,
  recentSessions,
  onOpenExerciseHistory,
}: ProgressScreenProps) {
  if (!activePlan) {
    return <EmptyHistoryScreen />;
  }

  return (
    <section className="mt-4 space-y-5">
      <PageHeader
        icon={History}
        label="Histórico"
        title="Seu progresso"
        description="Acompanhe as sessões concluídas e a evolução das cargas."
      />
      <Card padding="lg" variant="outlined">
        {cycleProgress ? (
          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <p className="text-body-md text-md-on-surface-variant">Ciclo atual</p>
              <p className="text-lg font-semibold">
                {cycleProgress.completedSessions} de{" "}
                {cycleProgress.plannedSessions}
              </p>
            </div>
            <LinearProgress
              aria-label="Progresso do ciclo"
              className="mt-3 h-2"
              value={cycleProgress.percentage}
            />
            <p className="mt-3 text-body-md leading-6 text-md-on-surface-variant">
              {cycleProgress.isComplete
                ? "Ciclo concluído. Gere um novo plano quando quiser trocar."
                : `${cycleProgress.remainingSessions} treinos restantes neste ciclo.`}
            </p>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <HistoryMetric
          icon={CalendarCheck2}
          label="Treinos"
          value={String(cycleProgress?.completedSessions ?? 0)}
        />
        <HistoryMetric
          icon={TrendingUp}
          label="Exercícios"
          value={String(loadSummaries.length)}
        />
      </div>

      <Card variant="outlined">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-label-lg font-medium text-md-secondary">Evolução de carga</p>
            <h3 className="font-semibold">Exercícios registrados</h3>
          </div>
        </div>

        {loadSummaries.length === 0 ? (
          <p className="mt-4 rounded-md bg-md-surface-container-high p-3 text-body-md leading-6 text-md-on-surface-variant">
            Finalize um treino para ver cargas e abrir o detalhe por exercicio.
          </p>
        ) : (
          <ListSurface className="mt-4">
            {loadSummaries.map((summary) => (
              <button
                className={`${listRowClassName} min-h-[8.5rem] px-4 py-4 [&+button]:border-t [&+button]:border-md-outline-variant`}
                key={summary.exerciseId}
                onClick={() => onOpenExerciseHistory(summary.exerciseId)}
                type="button"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold leading-5 text-md-on-surface">
                        {summary.exerciseName}
                      </h4>
                      <p className="mt-1 text-label-md text-md-on-surface-variant">
                        Atualizado em {formatShortDate(summary.updatedAt)}
                      </p>
                    </div>
                    <ChevronRight
                      className="mt-0.5 h-5 w-5 shrink-0 text-md-on-surface-variant"
                      aria-hidden="true"
                    />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-md-outline-variant bg-md-surface-container-low">
                    <div className="px-3 py-2.5">
                      <dt className="text-label-md font-medium text-md-on-surface-variant">
                        Última carga
                      </dt>
                      <dd className="mt-1 text-base font-semibold tabular-nums text-md-on-surface">
                        {formatLoad(summary.lastLoadKg)} kg
                      </dd>
                      <p className="mt-0.5 text-label-md text-md-on-surface-variant">
                        {summary.lastReps} reps
                      </p>
                    </div>
                    <div className="border-l border-md-outline-variant px-3 py-2.5">
                      <dt className="text-label-md font-medium text-md-on-surface-variant">
                        Maior carga
                      </dt>
                      <dd className="mt-1 text-base font-semibold tabular-nums text-md-on-surface">
                        {formatLoad(summary.maxLoadKg)} kg
                      </dd>
                    </div>
                  </dl>
                </div>
              </button>
            ))}
          </ListSurface>
        )}
      </Card>

      <Card variant="outlined">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-label-lg font-medium text-md-secondary">Ultimos treinos</p>
            <h3 className="font-semibold">Sessões concluídas</h3>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <p className="mt-4 rounded-md bg-md-surface-container-high p-3 text-body-md leading-6 text-md-on-surface-variant">
            Nenhuma sessao finalizada ainda.
          </p>
        ) : (
          <ListSurface className="mt-4">
            {recentSessions.map((session) => (
              <article
                className={`${listItemClassName} min-h-[5.5rem] px-4 py-3 [&+article]:border-t [&+article]:border-md-outline-variant`}
                key={session.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold leading-5 text-md-on-surface">
                        {session.routineName}
                      </h4>
                      <p className="mt-1 text-label-md text-md-on-surface-variant">
                        {formatShortDate(session.completedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-md-surface-container-low px-2.5 py-1 text-label-md font-semibold tabular-nums text-md-on-surface">
                      {session.setsCount} registros
                    </span>
                  </div>
                  <p className="mt-3 text-body-md text-md-on-surface-variant">
                    {session.exercisesCount} exercícios registrados
                  </p>
                </div>
              </article>
            ))}
          </ListSurface>
        )}
      </Card>
    </section>
  );
}

export function ExerciseHistoryScreen({
  details,
  isLoading,
}: {
  details: ExerciseHistoryDetails | null;
  isLoading: boolean;
}) {
  return (
    <section className="space-y-5">
      <Card padding="lg" variant="outlined">
        <p className="text-label-lg font-medium text-md-secondary">Detalhe do exercício</p>
        <h2 className="mt-2 text-headline-sm font-medium">
          {details?.exerciseName ?? "Carregando"}
        </h2>
        <p className="mt-3 text-body-md leading-6 text-md-on-surface-variant">
          Última carga, maior carga e registros recentes salvos neste dispositivo.
        </p>
      </Card>

      {isLoading || !details ? (
        <p className="rounded-lg border border-md-outline-variant bg-md-surface-container-lowest p-4 text-body-md text-md-on-surface-variant">
          Carregando histórico do exercício.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <HistoryMetric
              icon={TrendingUp}
              label="Última carga"
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
              label="Últimas reps"
              value={String(details.lastReps)}
            />
            <HistoryMetric
              icon={CalendarCheck2}
              label="Registros"
              value={String(details.completedSetsCount)}
            />
          </div>

          <Card variant="outlined">
            <h3 className="font-semibold">Registros recentes</h3>
            {details.records.length === 0 ? (
              <p className="mt-3 text-body-md leading-6 text-md-on-surface-variant">
                Nenhum registro encontrado para este exercício.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {details.records.map((record) => (
                  <article className="rounded-md bg-md-surface-container-high p-3" key={record.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold">
                          {record.routineName}
                        </h4>
                        <p className="mt-1 text-label-md text-md-on-surface-variant">
                          {formatShortDate(record.completedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-body-md font-semibold">
                        {formatLoad(record.loadKg)} kg
                      </span>
                    </div>
                    <p className="mt-3 text-body-md text-md-on-surface-variant">
                      {record.reps} reps
                    </p>
                    {record.notes ? (
                      <p className="mt-2 text-body-md leading-6">{record.notes}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </section>
  );
}

function EmptyHistoryScreen() {
  return (
    <>
      <Card className="mt-6" padding="lg" variant="outlined">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
          <History className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-label-lg font-medium text-md-secondary">Histórico</p>
          <h2 className="text-headline-sm font-medium">Sem treino ativo</h2>
        </div>
      </div>
      <p className="mt-4 text-body-md leading-6 text-md-on-surface-variant">
        Importe um plano e finalize uma sessao para acompanhar suas cargas.
      </p>
      </Card>
    </>
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
    <Card variant="outlined">
      <Icon className="h-5 w-5 text-md-secondary" aria-hidden="true" />
      <p className="mt-3 text-headline-sm font-medium tabular-nums">{value}</p>
      <p className="mt-1 text-body-md text-md-on-surface-variant">{label}</p>
    </Card>
  );
}
