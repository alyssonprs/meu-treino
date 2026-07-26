import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const ignoreClickRef = useRef(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const isFinished = remainingSeconds === 0;
  const label = isFinished ? "Descanso concluído" : formatTimer(remainingSeconds);

  useLayoutEffect(() => {
    if (position || !buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
  }, [position]);

  useEffect(() => {
    function keepTimerInViewport() {
      setPosition((current) =>
        current ? constrainPosition(current.x, current.y, buttonRef.current) : current,
      );
    }

    window.addEventListener("resize", keepTimerInViewport);
    return () => window.removeEventListener("resize", keepTimerInViewport);
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const origin = position ?? { x: rect.left, y: rect.top };
    dragRef.current = {
      pointerId: event.pointerId,
      originX: origin.x,
      originY: origin.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const distanceX = event.clientX - drag.startX;
    const distanceY = event.clientY - drag.startY;

    if (Math.abs(distanceX) > 4 || Math.abs(distanceY) > 4) {
      ignoreClickRef.current = true;
    }

    setPosition(
      constrainPosition(
        drag.originX + distanceX,
        drag.originY + distanceY,
        buttonRef.current,
      ),
    );
  }

  function releasePointer(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleClick() {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }

    onOpenExercise();
  }

  return (
    <Button
      aria-label={
        isFinished
          ? `Descanso concluído para ${exerciseName}. Voltar ao exercício.`
          : `Descanso de ${exerciseName}: ${formatTimer(remainingSeconds)}. Voltar ao exercício.`
      }
      className={cn(
        "z-40 h-12 max-w-[min(20rem,calc(100vw-2rem))] touch-none select-none gap-2 rounded-full px-4 shadow-md-3",
        position
          ? "fixed left-0 top-0 cursor-grab active:cursor-grabbing"
          : "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 cursor-grab active:cursor-grabbing",
        isFinished
          ? "bg-md-primary text-md-on-primary hover:bg-md-primary/90"
          : "bg-md-surface-container-highest text-md-on-surface hover:bg-md-surface-container-highest/90",
      )}
      onClick={handleClick}
      onPointerCancel={releasePointer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      ref={buttonRef}
      style={
        position
          ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
          : undefined
      }
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

function constrainPosition(
  x: number,
  y: number,
  button: HTMLButtonElement | null,
) {
  const margin = 8;
  const width = button?.offsetWidth ?? 0;
  const height = button?.offsetHeight ?? 0;

  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, window.innerWidth - width - margin)),
    y: Math.min(Math.max(margin, y), Math.max(margin, window.innerHeight - height - margin)),
  };
}
