import { Check, ChevronRight, Circle, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";
import {
  ListSurface,
  listCurrentRowClassName,
  listRowClassName,
  listStatusClassName,
} from "@/components/ui/list";
import type { WorkoutSessionDraft } from "@/services/workoutSessionService";
import { getExerciseGuide, type ExerciseGuide } from "./exerciseGuides";

type ActiveWorkoutScreenProps = {
  draft: WorkoutSessionDraft;
  onOpenExercise: (exerciseIndex: number) => void;
};

export function ActiveWorkoutScreen({
  draft,
  onOpenExercise,
}: ActiveWorkoutScreenProps) {
  return (
    <section className="pb-2 pt-1">
      <div className="space-y-5">
        <RoutineStepList label="Aquecimento" steps={draft.routine.warmup} tone="warmup" />

        <section aria-labelledby="routine-exercises-heading">
          <RoutineSectionLabel id="routine-exercises-heading">
            Exercícios da rotina
          </RoutineSectionLabel>
          <ListSurface className="mt-2">
            {draft.routine.exercises.map((exercise, exerciseIndex) => {
              const exerciseDraft = draft.exercises[exerciseIndex];
              const status = getExerciseStatus(draft, exerciseIndex);
              const statusMeta = getExerciseStatusMeta(status);
              const isCurrent = draft.currentExerciseIndex === exerciseIndex;

              return (
                <button
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${exercise.name}: ${status}, ${exerciseDraft.completedSets.filter((set) => set.completedAt !== null).length} de ${exerciseDraft.completedSets.length} séries concluídas`}
                  className={cn(
                    listRowClassName,
                    "min-h-[5.5rem] px-3 py-3",
                    exerciseIndex > 0 && "border-t border-md-outline-variant",
                    isCurrent && listCurrentRowClassName,
                  )}
                  key={exercise.id}
                  onClick={() => onOpenExercise(exerciseIndex)}
                  type="button"
                >
                  {isCurrent ? (
                    <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-md-primary" aria-hidden="true" />
                  ) : null}
                  <ExercisePreviewThumb fallbackIcon={<statusMeta.Icon className={cn("h-5 w-5", statusMeta.iconClassName)} aria-hidden="true" />} guide={getExerciseGuide(exercise)} />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-base font-semibold leading-5 text-md-on-surface">
                      {exercise.name}
                    </span>
                    <span className="mt-1 block text-sm text-md-on-surface-variant">
                      {exercise.sets} séries · {exercise.target_reps} reps
                    </span>
                    <span className={cn("mt-1 block text-xs font-semibold", statusMeta.textClassName)}>
                      {status}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-md-on-surface-variant" aria-hidden="true" />
                </button>
              );
            })}
          </ListSurface>
        </section>

        <RoutineStepList label="Cooldown" steps={draft.routine.cooldown} tone="cooldown" />
      </div>

    </section>
  );
}

function RoutineSectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p className="px-1 text-xs font-semibold uppercase tracking-wide text-md-secondary" id={id}>
      {children}
    </p>
  );
}

function RoutineStepList({
  label,
  steps,
  tone,
}: {
  label: string;
  steps: WorkoutSessionDraft["routine"]["warmup"];
  tone: "warmup" | "cooldown";
}) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section>
      <RoutineSectionLabel>{label}</RoutineSectionLabel>
      <ListSurface className="mt-2 bg-md-surface-container-low">
        {steps.map((step, index) => (
          <div
            className={cn(
              "flex min-h-14 items-center gap-3 px-4 py-3",
              index > 0 && "border-t border-md-outline-variant",
              tone === "warmup" ? "text-md-on-surface" : "text-md-on-surface",
            )}
            key={step.id}
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-full", tone === "warmup" ? "bg-md-tertiary" : "bg-md-secondary")} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{step.activity}</span>
              {step.notes ? <span className="mt-0.5 block truncate text-xs text-md-on-surface-variant">{step.notes}</span> : null}
            </span>
            <span className="shrink-0 rounded-full bg-md-surface-container-high px-2 py-1 text-xs font-semibold text-md-on-surface-variant">
              {step.duration_minutes} min
            </span>
          </div>
        ))}
      </ListSurface>
    </section>
  );
}

function ExercisePreviewThumb({ fallbackIcon, guide }: { fallbackIcon: ReactNode; guide: ExerciseGuide }) {
  return (
    <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-md-outline-variant", guide.imageUrl ? "bg-[hsl(var(--exercise-media-canvas))]" : "bg-md-surface-container-high")}>
      {guide.imageUrl ? (
        <img alt={guide.imageAlt} className="h-full w-full object-contain" height={112} loading="lazy" src={guide.imageUrl} width={112} />
      ) : (
        fallbackIcon
      )}
    </span>
  );
}

function getExerciseStatus(draft: WorkoutSessionDraft, exerciseIndex: number): "Pendente" | "Em progresso" | "Concluído" {
  const exercise = draft.exercises[exerciseIndex];

  if (exercise.result.completedAt !== null) {
    return "Concluído";
  }

  if (draft.currentExerciseIndex === exerciseIndex || exercise.completedSets.some((set) => set.completedAt !== null)) {
    return "Em progresso";
  }

  return "Pendente";
}

function getExerciseStatusMeta(status: ReturnType<typeof getExerciseStatus>) {
  if (status === "Concluído") {
    return { Icon: Check, iconClassName: listStatusClassName.completed, textClassName: listStatusClassName.completed };
  }

  if (status === "Em progresso") {
    return { Icon: CircleDot, iconClassName: listStatusClassName["in-progress"], textClassName: listStatusClassName["in-progress"] };
  }

  return { Icon: Circle, iconClassName: listStatusClassName.pending, textClassName: listStatusClassName.pending };
}
