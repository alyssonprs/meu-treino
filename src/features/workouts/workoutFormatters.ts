import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";

export function formatLoad(loadKg: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(loadKg);
}

export function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getRecommendationReasonLabel(
  reason: NextRoutineRecommendation["reason"],
) {
  if (reason === "first-workout") {
    return "Comece pela primeira rotina do plano ativo.";
  }

  if (reason === "cycle-restarted") {
    return "Ultima rotina concluida. O ciclo volta para o inicio.";
  }

  if (reason === "missing-last-routine") {
    return "Rotina anterior ausente. Recomendacao reiniciada pela primeira.";
  }

  return "Sequencia calculada a partir da ultima rotina finalizada.";
}

