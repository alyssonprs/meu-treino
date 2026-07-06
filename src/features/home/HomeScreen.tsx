import {
  CalendarCheck2,
  ClipboardList,
  FileInput,
  History,
  Play,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { LinearProgress } from "@/components/ui/progress";
import { PromptCopyButton } from "@/features/import-export/PromptCopyButton";
import type {
  CycleProgressSummary,
  ExerciseLoadSummary,
} from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { RoutineMetrics } from "@/features/workouts/RoutineMetrics";
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
  onOpenWorkoutList: () => void;
  onStartRecommendedWorkout: () => void;
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
  onOpenWorkoutList,
  onStartRecommendedWorkout,
}: HomeScreenProps) {
  if (!activePlan) {
    return (
      <>
        <Card className="mt-6" padding="lg" variant="outlined">
          <div className="flex items-center gap-2 text-label-lg font-medium text-md-secondary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Dados locais
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              {isLoadingActivePlan ? "Carregando..." : "Primeiro uso"}
            </p>
            <h2 className="text-3xl font-semibold leading-tight">
              {isLoadingActivePlan
                ? "Carregando seu treino"
                : "Importe seu treino para começar"}
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              {isLoadingActivePlan
                ? "Buscando os dados salvos neste dispositivo."
                : "Escolha um JSON de treino. Para criar um novo plano com IA, copie o prompt pronto e cole no agente de sua preferencia."}
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
            <PromptCopyButton className="h-14 w-full justify-start gap-3 text-base" />
          </div>
        </Card>

        <Card className="mt-5" variant="outlined">
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
              description="Cole o prompt em uma IA; ele inclui as URLs do modelo e catalogo."
              title="Prompt pronto"
            />
          </div>
        </Card>

        {workoutMessage ? (
          <Notice className="mt-5">
            {workoutMessage}
          </Notice>
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
  return (
    <>
      <Card className="mt-6" padding="lg" variant="outlined">
        <div className="flex items-center gap-2 text-label-lg font-medium text-md-secondary">
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
          <Chip as="span" variant="selected">
            Ativo
          </Chip>
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
            <LinearProgress
              aria-label="Progresso do ciclo"
              className="mt-4 h-3"
              value={cycleProgress.percentage}
            />
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
          <Notice className="mt-4">
            Ciclo concluído. Copie o prompt e gere um novo treino.
          </Notice>
        ) : null}
      </Card>

      {nextRecommendation && recommendedRoutine ? (
        <Card className="mt-5 border-md-primary" padding="lg" variant="outlined">
          <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Próximo treino
          </p>
          <h3 className="mt-5 text-3xl font-semibold leading-tight">
            {nextRecommendation.routineName}
          </h3>
          <p className="mt-2 text-base text-muted-foreground">
            {previousRoutine ?? getRecommendationReasonLabel(nextRecommendation.reason)}
          </p>

          <RoutineMetrics className="mt-5" routine={recommendedRoutine} />

          <Button
            className="mt-5 h-14 w-full gap-3 text-base"
            onClick={onStartRecommendedWorkout}
            type="button"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Iniciar treino
          </Button>
        </Card>
      ) : null}

      <Card className="mt-5" variant="outlined">
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
      </Card>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ShortcutButton
          icon={ClipboardList}
          label="Ver plano"
          onClick={onOpenWorkoutList}
        />
        <ShortcutButton icon={History} label="Histórico" onClick={onGoToHistory} />
      </div>

      {workoutMessage ? (
        <Notice className="mt-5">
          {workoutMessage}
        </Notice>
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
    <div className="rounded-md bg-md-surface-container-high p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-body-md text-md-on-surface-variant">
        {description}
      </p>
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 truncate text-body-md text-md-on-surface-variant">{value}</p>
      </div>
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
      className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-md-outline-variant bg-md-surface-container-lowest p-4 text-center font-medium text-md-on-surface transition-colors hover:bg-md-surface-container"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-7 w-7 text-md-secondary" aria-hidden="true" />
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
