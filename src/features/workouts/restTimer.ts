export type ActiveRestTimer = {
  exerciseIndex: number;
  nextSetIndex: number;
  endsAt: number;
};

export function getRestTimerRemainingSeconds(
  timer: ActiveRestTimer,
  now = Date.now(),
) {
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}
