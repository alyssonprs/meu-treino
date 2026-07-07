import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ExerciseLoadSummary } from "@/services/progressService";
import { formatLoad } from "@/features/workouts/workoutFormatters";

export function LoadHistoryPanel({
  summaries,
}: {
  summaries: ExerciseLoadSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <Card className="mt-5" variant="outlined">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Histórico de cargas</p>
            <h2 className="font-semibold">Sem registros ainda</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Finalize um treino para ver última carga, maior carga e evolução.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-5" variant="outlined">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info">Histórico de cargas</p>
          <h2 className="font-semibold">Ultimos exercicios</h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {summaries.slice(0, 4).map((summary) => (
          <article className="rounded-md bg-muted p-3" key={summary.exerciseId}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-sm font-semibold">
                {summary.exerciseName}
              </h3>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {summary.completedSetsCount} registros
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Última: </span>
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
          </article>
        ))}
      </div>
    </Card>
  );
}
