import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Clock3,
  Download,
  FileInput,
  History,
  Play,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import modelJsonUrl from "@/assets/meu-treino-modelo.json?url";
import promptTemplateUrl from "@/assets/prompt-treino-modelo.md?url";
import { Button } from "@/components/ui/button";
import type {
  CycleProgressSummary,
  ExerciseLoadSummary,
} from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { getRecommendationReasonLabel } from "@/features/workouts/workoutFormatters";

type HomeScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  cycleProgress: CycleProgressSummary | null;
  isLoadingActivePlan: boolean;
  loadSummaries: ExerciseLoadSummary[];
  nextRecommendation: NextRoutineRecommendation | null;
  workoutMessage: string | null;
  onChooseImportFile: () => void;
  onGoToHistory: () => void;
  onOpenWorkoutDetail: () => void;
};

export function HomeScreen({
  activePlan,
  cycleProgress,
  isLoadingActivePlan,
  loadSummaries,
  nextRecommendation,
  workoutMessage,
  onChooseImportFile,
  onGoToHistory,
  onOpenWorkoutDetail,
}: HomeScreenProps) {
  if (!activePlan) {
    return (
      <>
        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-info">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Dados locais
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              {isLoadingActivePlan ? "Carregando" : "Primeiro uso"}
            </p>
            <h2 className="text-3xl font-semibold leading-tight">
              {isLoadingActivePlan
                ? "Carregando seu treino"
                : "Importe seu treino para começar"}
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              {isLoadingActivePlan
                ? "Buscando os dados salvos neste dispositivo."
                : "Escolha um JSON de treino. Antes de salvar, o app valida o arquivo e mostra um resumo para confirmação."}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <Button
              className="h-14 justify-start gap-3 text-base"
              disabled={isLoadingActivePlan}
              onClick={onChooseImportFile}
              type="button"
            >
              <FileInput className="h-5 w-5" aria-hidden="true" />
              Importar JSON
            </Button>
            <Button
              asChild
              className="h-14 justify-start gap-3 text-base"
              variant="secondary"
            >
              <a download="meu-treino-modelo.json" href={modelJsonUrl}>
                <Download className="h-5 w-5" aria-hidden="true" />
                Baixar modelo
              </a>
            </Button>
            <Button
              asChild
              className="h-14 justify-start gap-3 text-base"
              variant="secondary"
            >
              <a download="prompt-treino-modelo.md" href={promptTemplateUrl}>
                <FileText className="h-5 w-5" aria-hidden="true" />
                Baixar prompt
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3">
            <BenefitItem
              description="Treino e cargas ficam neste dispositivo."
              title="100% local"
            />
            <BenefitItem
              description="Depois de instalado, o app abre mesmo sem internet."
              title="Funciona offline"
            />
            <BenefitItem
              description="Baixe o JSON base para gerar um plano compatível."
              title="Modelo pronto"
            />
          </div>
        </section>

        {workoutMessage ? (
          <p className="mt-5 rounded-lg border border-info bg-card p-4 text-sm leading-6">
            {workoutMessage}
          </p>
        ) : null}
      </>
    );
  }

  const recommendedRoutine = nextRecommendation
    ? activePlan.routines.find(
        (routine) => routine.id === nextRecommendation.routineId,
      )
    : null;
  const totalExercises = activePlan.routines.reduce(
    (total, routine) => total + routine.exercises.length,
    0,
  );
  const weekNumber =
    cycleProgress && activePlan.plan.daysPerWeek > 0
      ? Math.min(
          activePlan.plan.estimatedDurationWeeks,
          Math.max(
            1,
            Math.ceil(
              Math.max(1, cycleProgress.completedSessions + 1) /
                activePlan.plan.daysPerWeek,
            ),
          ),
        )
      : 1;
  const previousRoutine = getPreviousRoutineLabel(activePlan);
  const estimatedDuration = getEstimatedRoutineDuration(recommendedRoutine);
  const restRange = getRoutineRestRangeLabel(recommendedRoutine);

  return (
    <>
      <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-info">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Plano ativo
        </div>
        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Plano ativo
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              {isLoadingActivePlan
                ? "Carregando seu treino"
                : activePlan.plan.name}
            </h2>
          </div>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Ativo
          </span>
        </div>

        {cycleProgress ? (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm text-muted-foreground">Ciclo atual</p>
              <p className="text-lg font-semibold">
                {cycleProgress.completedSessions} de{" "}
                {cycleProgress.plannedSessions} treinos
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${cycleProgress.percentage}%` }}
              />
            </div>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Você está na{" "}
              <span className="font-semibold text-info">
                semana {weekNumber}
              </span>{" "}
              de {activePlan.plan.estimatedDurationWeeks} ·{" "}
              {activePlan.plan.daysPerWeek} treinos por semana
            </p>
          </div>
        ) : null}

        {cycleProgress?.isComplete ? (
          <p className="mt-4 rounded-md border border-info bg-muted p-3 text-sm leading-6">
            Ciclo concluído. Baixe o modelo e gere um novo treino.
          </p>
        ) : null}
      </section>

      {nextRecommendation && recommendedRoutine ? (
        <section className="mt-5 rounded-lg border border-primary bg-card p-5 shadow-sm">
          <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Próximo treino
          </p>
          <h3 className="mt-5 text-3xl font-semibold leading-tight">
            {nextRecommendation.routineName}
          </h3>
          <p className="mt-2 text-base text-muted-foreground">
            {previousRoutine ?? getRecommendationReasonLabel(nextRecommendation.reason)}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3">
            <MetricItem
              icon={Clock3}
              label="Duração"
              value={`${estimatedDuration} min`}
            />
            <MetricItem
              icon={CalendarCheck2}
              label="Volume"
              value={`${recommendedRoutine.exercises.length} exercícios`}
            />
            <MetricItem icon={RefreshCw} label="Descanso" value={restRange} />
          </div>

          <Button
            className="mt-5 h-14 w-full gap-3 text-base"
            onClick={onOpenWorkoutDetail}
            type="button"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Iniciar treino
          </Button>
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-border bg-card p-4">
        <div className="divide-y divide-border">
          <SummaryRow
            icon={CalendarCheck2}
            label="Último treino"
            value={getLastWorkoutLabel(activePlan)}
          />
          <SummaryRow
            icon={RefreshCw}
            label="Próxima troca"
            value={
              cycleProgress
                ? `${cycleProgress.remainingSessions} treinos restantes`
                : "Ciclo em andamento"
            }
          />
          <SummaryRow
            icon={TrendingUp}
            label="Carga preservada"
            value={`${loadSummaries.length || totalExercises} exercícios`}
          />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ShortcutButton
          icon={ClipboardList}
          label="Ver plano"
          onClick={onOpenWorkoutDetail}
        />
        <ShortcutButton icon={History} label="Histórico" onClick={onGoToHistory} />
      </div>

      {workoutMessage ? (
        <p className="mt-5 rounded-lg border border-info bg-card p-4 text-sm leading-6">
          {workoutMessage}
        </p>
      ) : null}
    </>
  );
}

function BenefitItem({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <Icon className="mx-auto h-5 w-5 text-info" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold leading-5">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{value}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function ShortcutButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center font-medium"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-7 w-7 text-info" aria-hidden="true" />
      <span className="mt-3">{label}</span>
    </button>
  );
}

function getPreviousRoutineLabel(activePlan: ActiveWorkoutPlanSnapshot) {
  const lastRoutineId = activePlan.progress.lastCompletedRoutineId;

  if (!lastRoutineId) {
    return null;
  }

  const lastRoutine = activePlan.routines.find(
    (routine) => routine.id === lastRoutineId,
  );

  return lastRoutine ? `Depois do ${lastRoutine.name}` : null;
}

function getLastWorkoutLabel(activePlan: ActiveWorkoutPlanSnapshot) {
  const lastRoutineLabel = getPreviousRoutineLabel(activePlan);

  if (!lastRoutineLabel || !activePlan.progress.lastCompletedAt) {
    return "Nenhum treino finalizado ainda";
  }

  return `${lastRoutineLabel.replace("Depois do ", "")} finalizado`;
}

function getEstimatedRoutineDuration(
  routine: ActiveWorkoutPlanSnapshot["routines"][number] | null | undefined,
) {
  if (!routine) {
    return 0;
  }

  const warmupMinutes = routine.warmup.reduce(
    (total, step) => total + step.duration_minutes,
    0,
  );
  const cooldownMinutes = routine.cooldown.reduce(
    (total, step) => total + step.duration_minutes,
    0,
  );
  const exerciseMinutes = routine.exercises.reduce((total, exercise) => {
    const restMinutes = ((exercise.rest_seconds ?? 90) * exercise.sets) / 60;

    return total + restMinutes + exercise.sets * 1.5;
  }, 0);

  return Math.max(1, Math.round(warmupMinutes + cooldownMinutes + exerciseMinutes));
}

function getRoutineRestRangeLabel(
  routine: ActiveWorkoutPlanSnapshot["routines"][number] | null | undefined,
) {
  if (!routine || routine.exercises.length === 0) {
    return "0s";
  }

  const rests = routine.exercises.map((exercise) => exercise.rest_seconds ?? 90);
  const min = Math.min(...rests);
  const max = Math.max(...rests);

  return min === max ? `${min}s` : `${min}-${max}s`;
}
