import barbellBenchPressGuideUrl from "@/assets/exercise-guides/barbell-bench-press.jpg";
import type { MovementPattern } from "@/domain/movementPattern";

export type VisualGuide = {
  imageUrl: string;
  imageAlt: string;
};

export const visualGuidesById: Record<string, VisualGuide> = {
  barbell_bench_press: {
    imageUrl: barbellBenchPressGuideUrl,
    imageAlt:
      "Guia visual do supino reto com peitoral em destaque e seta do movimento da barra.",
  },
};

export const visualGuideIdsByExerciseId: Record<string, string> = {
  "supino-reto-barra": "barbell_bench_press",
};

export const genericVisualGuidesByMovementPattern: Record<
  MovementPattern,
  VisualGuide
> = {
  horizontal_push: createGenericMovementGuide(
    "horizontal_push",
    "Guia generico de empurrar na horizontal com seta de ida e volta.",
  ),
  horizontal_pull: createGenericMovementGuide(
    "horizontal_pull",
    "Guia generico de puxar na horizontal com seta de ida e volta.",
  ),
  vertical_push: createGenericMovementGuide(
    "vertical_push",
    "Guia generico de empurrar acima da cabeca com seta vertical.",
  ),
  vertical_pull: createGenericMovementGuide(
    "vertical_pull",
    "Guia generico de puxar de cima para baixo com seta vertical.",
  ),
  squat: createGenericMovementGuide(
    "squat",
    "Guia generico de agachamento com seta vertical.",
  ),
  hinge: createGenericMovementGuide(
    "hinge",
    "Guia generico de dobradica de quadril com seta diagonal.",
  ),
  lunge: createGenericMovementGuide(
    "lunge",
    "Guia generico de avanco com seta diagonal.",
  ),
  hip_thrust: createGenericMovementGuide(
    "hip_thrust",
    "Guia generico de extensao de quadril com seta para cima.",
  ),
  leg_extension: createGenericMovementGuide(
    "leg_extension",
    "Guia generico de extensao de joelho com seta para frente.",
  ),
  leg_curl: createGenericMovementGuide(
    "leg_curl",
    "Guia generico de flexao de joelho com seta para tras.",
  ),
  calf_raise: createGenericMovementGuide(
    "calf_raise",
    "Guia generico de panturrilha com seta vertical.",
  ),
  shoulder_abduction: createGenericMovementGuide(
    "shoulder_abduction",
    "Guia generico de elevacao lateral com setas para os lados.",
  ),
  elbow_flexion: createGenericMovementGuide(
    "elbow_flexion",
    "Guia generico de flexao de cotovelo com seta de subida.",
  ),
  elbow_extension: createGenericMovementGuide(
    "elbow_extension",
    "Guia generico de extensao de cotovelo com seta de descida.",
  ),
  core_flexion: createGenericMovementGuide(
    "core_flexion",
    "Guia generico de flexao de tronco com seta curva.",
  ),
  core_anti_extension: createGenericMovementGuide(
    "core_anti_extension",
    "Guia generico de estabilidade do core contra extensao.",
  ),
  core_rotation: createGenericMovementGuide(
    "core_rotation",
    "Guia generico de rotacao de tronco com seta curva.",
  ),
};

function createGenericMovementGuide(
  pattern: MovementPattern,
  imageAlt: string,
): VisualGuide {
  return {
    imageUrl: createGenericMovementSvgUrl(pattern),
    imageAlt,
  };
}

function createGenericMovementSvgUrl(pattern: MovementPattern) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">
  <defs>
    <marker id="arrow-${pattern}" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
      <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8"/>
    </marker>
  </defs>
  <rect width="640" height="360" rx="32" fill="#101827"/>
  <circle cx="320" cy="82" r="28" fill="#d9f99d"/>
  <path d="M320 112 L320 218" stroke="#d9f99d" stroke-width="28" stroke-linecap="round"/>
  <path d="M248 156 L392 156" stroke="#7dd3fc" stroke-width="24" stroke-linecap="round"/>
  <path d="M290 218 L246 296" stroke="#a7f3d0" stroke-width="24" stroke-linecap="round"/>
  <path d="M350 218 L394 296" stroke="#a7f3d0" stroke-width="24" stroke-linecap="round"/>
  ${getArrowMarkup(pattern)}
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getArrowMarkup(pattern: MovementPattern) {
  const arrowClass =
    'stroke="#38bdf8" stroke-width="18" stroke-linecap="round" fill="none" marker-end=';

  if (pattern === "horizontal_push" || pattern === "horizontal_pull") {
    return `<path d="M206 156 H434" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (
    pattern === "vertical_push" ||
    pattern === "calf_raise" ||
    pattern === "hip_thrust"
  ) {
    return `<path d="M320 288 V132" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "vertical_pull" || pattern === "elbow_extension") {
    return `<path d="M320 94 V252" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "hinge" || pattern === "lunge") {
    return `<path d="M220 278 C278 226 338 198 420 164" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "shoulder_abduction") {
    return `<path d="M248 158 C214 128 198 100 188 68" ${arrowClass}"url(#arrow-${pattern})"/><path d="M392 158 C426 128 442 100 452 68" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "core_flexion" || pattern === "core_rotation") {
    return `<path d="M246 242 C292 184 348 166 418 188" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "leg_extension") {
    return `<path d="M318 242 C366 230 414 224 462 226" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "leg_curl") {
    return `<path d="M420 286 C374 278 342 252 322 214" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  if (pattern === "elbow_flexion") {
    return `<path d="M238 218 C224 184 232 158 262 138" ${arrowClass}"url(#arrow-${pattern})"/>`;
  }

  return `<path d="M200 252 H440" ${arrowClass}"url(#arrow-${pattern})"/>`;
}
