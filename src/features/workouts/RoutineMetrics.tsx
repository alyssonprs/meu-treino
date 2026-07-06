import { CalendarCheck2, Clock3, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

type Routine = ActiveWorkoutPlanSnapshot["routines"][number];

type RoutineMetricsProps = {
  routine: Routine;
  className?: string;
};

export function RoutineMetrics({ routine, className = "" }: RoutineMetricsProps) {
  const metrics = [
    {
      icon: Clock3,
      value: `${getEstimatedRoutineDuration(routine)} min`,
    },
    {
      icon: CalendarCheck2,
      value: `${routine.exercises.length} exercícios`,
    },
    {
      icon: RefreshCw,
      value: getRoutineRestRangeLabel(routine),
    },
  ];

  return (
    <div
      className={[
        "grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <RoutineMetric
          icon={metric.icon}
          key={metric.value}
          value={metric.value}
        />
      ))}
    </div>
  );
}

function RoutineMetric({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <Icon className="mx-auto h-5 w-5 text-info" aria-hidden="true" />
      <p className="mt-2 truncate text-sm font-semibold leading-5">{value}</p>
    </div>
  );
}

function getEstimatedRoutineDuration(routine: Routine) {
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

  return Math.max(
    1,
    Math.round(warmupMinutes + cooldownMinutes + exerciseMinutes),
  );
}

function getRoutineRestRangeLabel(routine: Routine) {
  if (routine.exercises.length === 0) {
    return "0s";
  }

  const rests = routine.exercises.map((exercise) => exercise.rest_seconds ?? 90);
  const min = Math.min(...rests);
  const max = Math.max(...rests);

  return min === max ? `${min}s` : `${min}-${max}s`;
}
