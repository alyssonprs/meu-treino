import { TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { formatTimer } from "./workoutFormatters";

type FloatingRestTimerProps = {
  exerciseName: string;
  remainingSeconds: number;
  onOpenExercise: () => void;
};

export function FloatingRestTimer({
  exerciseName,
  remainingSeconds,
  onOpenExercise,
}: FloatingRestTimerProps) {
  const isFinished = remainingSeconds === 0;
  const label = isFinished ? "Descanso concluído" : formatTimer(remainingSeconds);

  return (
    <Button
      aria-label={
        isFinished
          ? `Descanso concluído para ${exerciseName}. Voltar ao exercício.`
          : `Descanso de ${exerciseName}: ${formatTimer(remainingSeconds)}. Voltar ao exercício.`
      }
      className={cn(
        "h-12 max-w-[min(20rem,calc(100vw-2rem))] gap-2 rounded-full px-4 shadow-md-3",
        isFinished
          ? "bg-md-primary text-md-on-primary hover:bg-md-primary/90"
          : "bg-md-surface-container-highest text-md-on-surface hover:bg-md-surface-container-highest/90",
      )}
      onClick={onOpenExercise}
      type="button"
    >
      <TimerReset className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate text-sm font-semibold">{exerciseName}</span>
      <span className="shrink-0 rounded-full bg-md-on-surface/10 px-2 py-1 text-sm font-bold tabular-nums">
        {label}
      </span>
      {isFinished ? <span className="sr-only" aria-live="polite">Descanso concluído.</span> : null}
    </Button>
  );
}
