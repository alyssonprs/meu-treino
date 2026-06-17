import { writeFile } from "node:fs/promises";

const outUrl = new URL("./meu-treino-wireframes-v2.excalidraw", import.meta.url);
const UPDATED = 1781481600000;
let seq = 1;

const dark = {
  bg: "#0F1115",
  surface: "#191C22",
  elevated: "#232832",
  border: "#343A46",
  text: "#F7FAFC",
  muted: "#A7B0BE",
  weak: "#737D8C",
  primary: "#A3E635",
  info: "#22D3EE",
  warning: "#F59E0B",
  error: "#F43F5E",
  inkOnPrimary: "#0F1115",
};

const light = {
  bg: "#F6F8FA",
  surface: "#FFFFFF",
  elevated: "#EEF2F6",
  border: "#D8DEE6",
  text: "#161A1D",
  muted: "#667085",
  weak: "#98A2B3",
  primary: "#2563EB",
  success: "#16A34A",
  info: "#0891B2",
  warning: "#F59E0B",
  error: "#DC2626",
  inkOnPrimary: "#FFFFFF",
};

function nextId(prefix) {
  return `${prefix}-${String(seq++).padStart(4, "0")}`;
}

function base(prefix, type, x, y, width, height, strokeColor, backgroundColor) {
  const n = seq;
  return {
    id: nextId(prefix),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor,
    backgroundColor,
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: 1000 + n,
    version: 1,
    versionNonce: 900000 + n,
    isDeleted: false,
    boundElements: null,
    updated: UPDATED,
    link: null,
    locked: false,
  };
}

function rect(prefix, x, y, width, height, colors, opts = {}) {
  const el = base(
    prefix,
    "rectangle",
    x,
    y,
    width,
    height,
    opts.stroke ?? colors.border,
    opts.fill ?? colors.surface,
  );
  if (opts.strokeWidth !== undefined) el.strokeWidth = opts.strokeWidth;
  if (opts.round === false) el.roundness = null;
  return el;
}

function ellipse(prefix, x, y, width, height, colors, opts = {}) {
  return {
    ...base(
      prefix,
      "ellipse",
      x,
      y,
      width,
      height,
      opts.stroke ?? colors.border,
      opts.fill ?? "transparent",
    ),
    roundness: null,
  };
}

function text(prefix, x, y, content, colors, opts = {}) {
  const fontSize = opts.size ?? 16;
  const lineHeight = opts.lineHeight ?? 1.25;
  const lines = String(content).split("\n").length;
  const height = opts.height ?? Math.ceil(lines * fontSize * lineHeight);
  return {
    ...base(
      prefix,
      "text",
      x,
      y,
      opts.width ?? 260,
      height,
      opts.color ?? colors.text,
      "transparent",
    ),
    roundness: null,
    text: content,
    fontSize,
    fontFamily: 1,
    textAlign: opts.align ?? "left",
    verticalAlign: opts.valign ?? "top",
    baseline: Math.max(1, height - Math.ceil(fontSize * 0.2)),
    containerId: null,
    originalText: content,
    lineHeight,
  };
}

function line(prefix, x1, y1, x2, y2, colors, opts = {}) {
  const n = seq;
  return {
    id: nextId(prefix),
    type: "line",
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    angle: 0,
    strokeColor: opts.stroke ?? colors.border,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: opts.strokeWidth ?? 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 1000 + n,
    version: 1,
    versionNonce: 900000 + n,
    isDeleted: false,
    boundElements: null,
    updated: UPDATED,
    link: null,
    locked: false,
    points: [
      [0, 0],
      [x2 - x1, y2 - y1],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
  };
}

function button(prefix, x, y, width, label, colors, variant = "primary") {
  const isPrimary = variant === "primary";
  const fill = isPrimary
    ? colors.primary
    : variant === "danger"
      ? colors.error
      : "transparent";
  const stroke = isPrimary
    ? colors.primary
    : variant === "danger"
      ? colors.error
      : variant === "info"
        ? colors.info
        : colors.border;
  const color = isPrimary
    ? colors.inkOnPrimary
    : variant === "danger"
      ? colors.error
      : variant === "info"
        ? colors.info
        : colors.text;

  return [
    rect(`${prefix}-btn`, x, y, width, 54, colors, { fill, stroke }),
    text(`${prefix}-label`, x + 14, y + 16, label, colors, {
      width: width - 28,
      size: 17,
      align: "center",
      color,
    }),
  ];
}

function pill(prefix, x, y, width, label, colors, variant = "info") {
  const color =
    variant === "primary"
      ? colors.primary
      : variant === "warning"
        ? colors.warning
        : variant === "error"
          ? colors.error
          : colors.info;
  return [
    rect(`${prefix}-pill`, x, y, width, 30, colors, {
      fill: colors.elevated,
      stroke: color,
    }),
    text(`${prefix}-label`, x + 10, y + 7, label, colors, {
      width: width - 20,
      size: 13,
      align: "center",
      color,
    }),
  ];
}

function nav(x, y, colors, active = "Inicio") {
  const labels = ["Inicio", "Treino", "Historico", "Ajustes"];
  const els = [
    rect("nav-bg", x, y + 764, 390, 80, colors, {
      fill: colors.surface,
      stroke: colors.border,
      round: false,
    }),
  ];

  labels.forEach((label, index) => {
    const cx = x + 36 + index * 91;
    const activeItem = label === active;
    els.push(
      ellipse("nav-icon", cx, y + 781, 24, 24, colors, {
        fill: activeItem ? colors.primary : "transparent",
        stroke: activeItem ? colors.primary : colors.weak,
      }),
      text("nav-label", cx - 20, y + 812, label, colors, {
        width: 66,
        size: 12,
        align: "center",
        color: activeItem ? colors.text : colors.muted,
      }),
    );
  });

  return els;
}

function phoneFrame(x, y, title, colors, opts = {}) {
  return [
    rect("phone-frame", x, y, 390, 844, colors, {
      fill: colors.bg,
      stroke: opts.light ? colors.border : "#1E1E1E",
      strokeWidth: 2,
    }),
    text("screen-title", x + 24, y + 24, title, colors, {
      width: 340,
      size: 22,
      color: colors.text,
    }),
  ];
}

function header(x, y, colors, title = "Meu Treino", right = "Dados locais") {
  return [
    rect("header", x + 24, y + 68, 342, 52, colors, {
      fill: colors.surface,
      stroke: colors.border,
    }),
    text("header-title", x + 42, y + 84, title, colors, {
      width: 160,
      size: 16,
    }),
    text("header-right", x + 210, y + 86, right, colors, {
      width: 136,
      size: 13,
      align: "right",
      color: colors.muted,
    }),
  ];
}

function progressBar(prefix, x, y, width, pct, colors, opts = {}) {
  const h = opts.h ?? 12;
  const fill = opts.fill ?? colors.primary;
  return [
    rect(`${prefix}-track`, x, y, width, h, colors, {
      fill: colors.elevated,
      stroke: colors.elevated,
    }),
    rect(`${prefix}-fill`, x, y, Math.max(8, Math.round(width * pct)), h, colors, {
      fill,
      stroke: fill,
    }),
  ];
}

const elements = [];
function add(...items) {
  elements.push(...items.flat().filter(Boolean));
}

const X0 = 40;
const Y0 = 80;
const GX = 460;
const GY = 940;

function pos(index) {
  return [X0 + (index % 4) * GX, Y0 + Math.floor(index / 4) * GY];
}

function exerciseRow(prefix, x, y, colors, title, meta, last) {
  return [
    rect(`${prefix}-row`, x, y, 326, 76, colors, {
      fill: colors.elevated,
      stroke: colors.border,
    }),
    text(`${prefix}-title`, x + 16, y + 13, title, colors, {
      width: 190,
      size: 16,
    }),
    text(`${prefix}-meta`, x + 16, y + 38, meta, colors, {
      width: 200,
      size: 13,
      color: colors.muted,
    }),
    text(`${prefix}-last`, x + 232, y + 20, last, colors, {
      width: 76,
      size: 14,
      align: "right",
      color: colors.info,
    }),
  ];
}

function screen01(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-01 Inicio sem treino", c), header(x, y, c));
  add(rect("empty-card", x + 32, y + 178, 326, 226, c));
  add(ellipse("empty-icon", x + 156, y + 206, 78, 78, c, {
    fill: c.elevated,
    stroke: c.info,
  }));
  add(
    text(
      "empty-copy",
      x + 60,
      y + 304,
      "Importe seu treino\nUse um JSON gerado a partir do modelo do app.",
      c,
      { width: 270, size: 19, align: "center", lineHeight: 1.35 },
    ),
  );
  add(button("import-json", x + 48, y + 438, 294, "Importar JSON", c));
  add(button("download-model", x + 48, y + 508, 294, "Baixar modelo", c, "info"));
  add(rect("local-note", x + 48, y + 598, 294, 104, c));
  add(
    text(
      "local-note-text",
      x + 70,
      y + 620,
      "100% local\nFunciona offline\nProgresso salvo no aparelho",
      c,
      { width: 250, size: 16, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(nav(x, y, c, "Inicio"));
}

function screen02(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-02 Inicio com treino ativo v2", c), header(x, y, c));
  add(rect("plan-card", x + 32, y + 148, 326, 132, c));
  add(text("plan-title", x + 56, y + 170, "Hipertrofia 4x", c, { width: 190, size: 21 }));
  add(
    text("plan-subtitle", x + 56, y + 203, "7 de 16 treinos concluidos", c, {
      width: 230,
      size: 15,
      color: c.muted,
    }),
  );
  add(progressBar("cycle-progress", x + 56, y + 238, 220, 0.44, c));
  add(pill("cycle-pill", x + 274, y + 174, 64, "44%", c, "primary"));
  add(
    text("plan-week", x + 56, y + 258, "Semana 3 de 8 | 4 treinos por semana", c, {
      width: 260,
      size: 13,
      color: c.muted,
    }),
  );
  add(rect("next-card", x + 32, y + 306, 326, 252, c, {
    stroke: c.primary,
    strokeWidth: 2,
  }));
  add(pill("recommended", x + 56, y + 330, 130, "Proximo treino", c, "primary"));
  add(text("next-title", x + 56, y + 376, "Treino B\nSuperiores", c, {
    width: 220,
    size: 26,
    lineHeight: 1.12,
  }));
  add(
    text("next-meta", x + 56, y + 444, "Depois do Treino A\n42 min | 6 exercicios | 90-120s descanso", c, {
      width: 230,
      size: 15,
      color: c.muted,
      lineHeight: 1.35,
    }),
  );
  add(button("start-workout", x + 56, y + 500, 278, "Iniciar treino", c));
  add(
    text("start-note", x + 78, y + 564, "Ao tocar, abre UX-03 antes da execucao.", c, {
      width: 234,
      size: 12,
      align: "center",
      color: c.weak,
    }),
  );
  add(rect("quick-status", x + 32, y + 598, 326, 150, c));
  add(
    text(
      "quick-status-text",
      x + 56,
      y + 620,
      "Ultimo treino: A ontem\nProxima troca: faltam 9\nCarga preservada: 18 exercicios\nAtalhos: Ver plano | Historico",
      c,
      { width: 268, size: 16, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(nav(x, y, c, "Inicio"));
}

function screen03(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-03 Detalhe do treino v2", c));
  add(text("back-title", x + 24, y + 74, "< Treino B - Superiores", c, {
    width: 270,
    size: 18,
  }));
  add(rect("summary-card", x + 32, y + 124, 326, 122, c));
  add(text("summary-title", x + 56, y + 148, "Lista de exercicios", c, {
    width: 210,
    size: 21,
  }));
  add(
    text(
      "summary-meta",
      x + 56,
      y + 184,
      "Toque no exercicio que vai fazer agora. Se um aparelho estiver ocupado, toque em outro.",
      c,
      { width: 270, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(text("tap-hint", x + 56, y + 216, "Cada item abre UX-04 diretamente.", c, {
    width: 250,
    size: 14,
    color: c.info,
  }));
  add(text("section-warmup", x + 32, y + 270, "Aquecimento", c, {
    width: 180,
    size: 16,
    color: c.info,
  }));
  add(rect("warmup-row", x + 32, y + 300, 326, 54, c));
  add(text("warmup-text", x + 52, y + 316, "Mobilidade + 5 min esteira", c, {
    width: 250,
    size: 15,
    color: c.muted,
  }));
  add(text("section-exercises", x + 32, y + 378, "Exercicios do treino", c, {
    width: 180,
    size: 16,
    color: c.info,
  }));
  add(exerciseRow("ex1", x + 32, y + 406, c, "Supino reto", "3x 8-10 | RIR alvo 2", "50 kg"));
  add(text("ex1-action", x + 244, y + 440, "Abrir >", c, {
    width: 76,
    size: 13,
    align: "right",
    color: c.primary,
  }));
  add(exerciseRow("ex2", x + 32, y + 492, c, "Remada baixa", "3x 10-12 | RIR alvo 2", "45 kg"));
  add(text("ex2-action", x + 244, y + 526, "Abrir >", c, {
    width: 76,
    size: 13,
    align: "right",
    color: c.primary,
  }));
  add(exerciseRow("ex3", x + 32, y + 578, c, "Desenvolvimento", "3x 8-10 | RIR alvo 2", "22 kg"));
  add(text("ex3-action", x + 244, y + 612, "Abrir >", c, {
    width: 76,
    size: 13,
    align: "right",
    color: c.primary,
  }));
  add(text("more-exercises", x + 52, y + 666, "+ 3 exercicios e cooldown", c, {
    width: 240,
    size: 15,
    color: c.weak,
  }));
  add(rect("detail-rule", x + 48, y + 704, 294, 48, c, { stroke: c.info }));
  add(text("detail-rule-copy", x + 66, y + 718, "Sem botao global: toque em um exercicio.", c, {
    width: 258,
    size: 14,
    align: "center",
    color: c.info,
  }));
  add(nav(x, y, c, "Treino"));
}

function screen04(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-04 Execucao do treino v2", c));
  add(
    text(
      "active-head",
      x + 24,
      y + 74,
      "< Lista de exercicios        Pausar   Parar\nRemada baixa | exercicio 2 de 6",
      c,
      { width: 342, size: 16, lineHeight: 1.35 },
    ),
  );
  add(progressBar("routine-progress", x + 32, y + 124, 326, 0.33, c, { h: 8 }));
  add(rect("timer-compact", x + 32, y + 150, 326, 142, c, { stroke: c.info }));
  add(text("timer-compact-copy", x + 56, y + 160, "Descanso apos serie salva", c, {
    width: 210,
    size: 15,
    color: c.info,
  }));
  add(text("timer-compact-time", x + 56, y + 184, "01:20", c, {
    width: 130,
    size: 31,
    color: c.info,
  }));
  add(text("timer-next-copy", x + 198, y + 174, "Proxima serie\n45 kg sugerido", c, {
    width: 128,
    size: 13,
    color: c.muted,
    lineHeight: 1.35,
    align: "right",
  }));
  add(button("add-rest", x + 52, y + 230, 86, "+30s", c, "secondary"));
  add(button("skip-rest", x + 148, y + 230, 78, "Pular", c, "info"));
  add(button("start-next-set", x + 236, y + 230, 98, "Prox. serie", c));
  add(rect("active-exercise", x + 32, y + 318, 326, 102, c));
  add(text("active-ex-title", x + 56, y + 338, "Remada baixa", c, { width: 220, size: 22 }));
  add(
    text(
      "active-ex-meta",
      x + 56,
      y + 374,
      "3 series | 10-12 reps | RIR alvo 2\nUltima carga: 45 kg",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(rect("set-card", x + 32, y + 446, 326, 206, c));
  add(text("set-title", x + 56, y + 464, "Entrada do exercicio", c, {
    width: 190,
    size: 18,
    color: c.primary,
  }));
  add(text("set-helper", x + 56, y + 492, "Carga, reps e RIR pertencem ao exercicio atual.", c, {
    width: 255,
    size: 12,
    color: c.weak,
  }));
  [
    ["Carga", "45"],
    ["Reps", "10"],
    ["RIR", "2"],
  ].forEach(([label, value], idx) => {
    const bx = x + 56 + idx * 96;
    add(text(`set-label-${idx}`, bx, y + 516, label, c, {
      width: 76,
      size: 13,
      color: c.muted,
      align: "center",
    }));
    add(rect(`set-value-${idx}`, bx, y + 540, 76, 48, c, {
      fill: c.elevated,
      stroke: c.border,
    }));
    add(text(`set-value-text-${idx}`, bx + 4, y + 552, value, c, {
      width: 68,
      size: 22,
      align: "center",
    }));
    add(rect(`minus-${idx}`, bx, y + 598, 34, 30, c, { fill: "transparent" }));
    add(text(`minus-text-${idx}`, bx + 9, y + 602, "-", c, {
      width: 16,
      size: 18,
      align: "center",
      color: c.muted,
    }));
    add(rect(`plus-${idx}`, bx + 42, y + 598, 34, 30, c, { fill: "transparent" }));
    add(text(`plus-text-${idx}`, bx + 50, y + 602, "+", c, {
      width: 18,
      size: 18,
      align: "center",
      color: c.primary,
    }));
  });
  add(text("set-row-1", x + 56, y + 630, "Serie 1 concluida   45 kg   10   RIR 2", c, {
    width: 270,
    size: 13,
    color: c.weak,
  }));
  add(button("save-set", x + 32, y + 684, 326, "Salvar serie", c));
  add(button("next-exercise", x + 32, y + 752, 326, "Voltar a lista", c, "secondary"));
}

function screen06(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-06 Finalizacao", c));
  add(rect("done-hero", x + 32, y + 126, 326, 220, c, {
    stroke: c.primary,
    strokeWidth: 2,
  }));
  add(ellipse("done-icon", x + 154, y + 154, 82, 82, c, {
    fill: c.primary,
    stroke: c.primary,
  }));
  add(text("done-check", x + 169, y + 181, "OK", c, {
    width: 52,
    size: 25,
    align: "center",
    color: c.inkOnPrimary,
  }));
  add(text("done-title", x + 68, y + 256, "Treino B concluido", c, {
    width: 254,
    size: 24,
    align: "center",
  }));
  add(text("done-subtitle", x + 72, y + 294, "Ultima rotina finalizada foi salva.", c, {
    width: 246,
    size: 14,
    align: "center",
    color: c.muted,
  }));
  add(rect("done-stats", x + 32, y + 376, 326, 142, c));
  add(
    text(
      "done-stats-copy",
      x + 56,
      y + 400,
      "6 exercicios\n18 series registradas\n7 de 16 treinos no ciclo",
      c,
      { width: 260, size: 17, color: c.muted, lineHeight: 1.5 },
    ),
  );
  add(rect("next-reco-card", x + 32, y + 548, 326, 116, c, { stroke: c.info }));
  add(
    text(
      "next-reco-text",
      x + 56,
      y + 572,
      "Proxima recomendacao\nTreino C - Pernas\nBaseado na ordem da rotina",
      c,
      { width: 260, size: 17, lineHeight: 1.35 },
    ),
  );
  add(button("finish-home", x + 32, y + 704, 326, "Voltar ao inicio", c));
  add(button("finish-history", x + 32, y + 770, 326, "Ver historico", c, "secondary"));
}

function historyItem(prefix, x, y, colors, title, meta, delta) {
  return [
    rect(`${prefix}-item`, x, y, 326, 82, colors),
    text(`${prefix}-title`, x + 18, y + 14, title, colors, { width: 190, size: 16 }),
    text(`${prefix}-meta`, x + 18, y + 40, meta, colors, {
      width: 190,
      size: 13,
      color: colors.muted,
    }),
    text(`${prefix}-delta`, x + 236, y + 26, delta, colors, {
      width: 72,
      size: 16,
      align: "right",
      color: delta.startsWith("+") ? colors.primary : colors.muted,
    }),
  ];
}

function screen07(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-07 Historico", c), header(x, y, c, "Historico", "Dados locais"));
  add(rect("history-summary", x + 32, y + 148, 326, 126, c));
  add(text("history-summary-title", x + 56, y + 172, "Resumo do ciclo", c, {
    width: 190,
    size: 20,
  }));
  add(
    text(
      "history-summary-copy",
      x + 56,
      y + 210,
      "7 treinos concluidos\n18 exercicios com carga salva",
      c,
      { width: 240, size: 15, color: c.muted, lineHeight: 1.4 },
    ),
  );
  add(pill("history-filter", x + 232, y + 172, 94, "30 dias", c));
  add(text("loads-title", x + 32, y + 304, "Evolucao de carga", c, {
    width: 210,
    size: 17,
    color: c.info,
  }));
  add(historyItem("hist1", x + 32, y + 338, c, "Supino reto", "50 kg -> 52.5 kg", "+2.5"));
  add(historyItem("hist2", x + 32, y + 432, c, "Remada baixa", "42.5 kg -> 45 kg", "+2.5"));
  add(historyItem("hist3", x + 32, y + 526, c, "Agachamento", "80 kg -> 80 kg", "0"));
  add(text("sessions-title", x + 32, y + 642, "Ultimos treinos", c, {
    width: 210,
    size: 17,
    color: c.info,
  }));
  add(
    text(
      "sessions-copy",
      x + 52,
      y + 674,
      "Ontem   Treino A concluido\nSabado  Treino D concluido",
      c,
      { width: 260, size: 15, color: c.muted, lineHeight: 1.55 },
    ),
  );
  add(nav(x, y, c, "Historico"));
}

function screen08(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-08 Progresso do exercicio", c));
  add(text("exercise-detail-head", x + 24, y + 74, "< Historico", c, {
    width: 150,
    size: 17,
  }));
  add(rect("exercise-detail-card", x + 32, y + 124, 326, 170, c));
  add(text("exercise-detail-title", x + 56, y + 150, "Supino reto", c, {
    width: 230,
    size: 24,
  }));
  add(text("exercise-detail-meta", x + 56, y + 188, "Peitoral | barra | bilateral", c, {
    width: 230,
    size: 14,
    color: c.muted,
  }));
  add(text("exercise-detail-loads", x + 56, y + 226, "Ultima: 52.5 kg\nMaior: 52.5 kg", c, {
    width: 150,
    size: 17,
    lineHeight: 1.45,
  }));
  add(pill("exercise-trend", x + 230, y + 230, 90, "+5%", c, "primary"));
  add(rect("chart-card", x + 32, y + 324, 326, 220, c));
  add(text("chart-title", x + 56, y + 348, "Carga nas ultimas sessoes", c, {
    width: 230,
    size: 16,
    color: c.info,
  }));
  add(line("chart-axis-x", x + 64, y + 494, x + 310, y + 494, c));
  add(line("chart-axis-y", x + 64, y + 388, x + 64, y + 494, c));
  const points = [
    [80, 472],
    [128, 458],
    [176, 448],
    [224, 424],
    [272, 402],
  ];
  points.forEach((point, idx) => {
    add(ellipse(`chart-dot-${idx}`, x + point[0] - 5, y + point[1] - 5, 10, 10, c, {
      fill: c.primary,
      stroke: c.primary,
    }));
    if (idx > 0) {
      const prev = points[idx - 1];
      add(line(`chart-line-${idx}`, x + prev[0], y + prev[1], x + point[0], y + point[1], c, {
        stroke: c.primary,
        strokeWidth: 2,
      }));
    }
  });
  add(rect("history-log", x + 32, y + 574, 326, 148, c));
  add(
    text(
      "history-log-text",
      x + 56,
      y + 598,
      "Ultimos registros\nHoje       52.5 kg x 9 reps | RIR 2\nSemana 1   50 kg x 10 reps | RIR 2",
      c,
      { width: 260, size: 15, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(nav(x, y, c, "Historico"));
}

function screen10(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-10 Preview do JSON", c));
  add(text("preview-head", x + 24, y + 74, "< Importar treino", c, {
    width: 210,
    size: 17,
  }));
  add(rect("preview-card", x + 32, y + 124, 326, 266, c, {
    stroke: c.primary,
    strokeWidth: 2,
  }));
  add(pill("valid-json", x + 56, y + 148, 112, "JSON valido", c, "primary"));
  add(text("preview-title", x + 56, y + 194, "Hipertrofia iniciante", c, {
    width: 260,
    size: 24,
  }));
  add(
    text(
      "preview-copy",
      x + 56,
      y + 234,
      "Objetivo: hipertrofia\nNivel: iniciante\n4 semanas | 4 dias por semana\n4 rotinas | 28 exercicios",
      c,
      { width: 260, size: 16, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(rect("replace-warning", x + 32, y + 420, 326, 132, c, { stroke: c.warning }));
  add(
    text(
      "replace-warning-copy",
      x + 56,
      y + 444,
      "Substituir treino atual?\nA sequencia antiga sera descartada.\nHistorico de cargas sera preservado.",
      c,
      { width: 260, size: 15, color: c.warning, lineHeight: 1.45 },
    ),
  );
  add(button("confirm-import", x + 32, y + 604, 326, "Confirmar importacao", c));
  add(button("cancel-import", x + 32, y + 674, 326, "Cancelar", c, "secondary"));
  add(nav(x, y, c, "Treino"));
}

function screen11(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-11 Erro de importacao", c));
  add(text("error-head", x + 24, y + 74, "< Importar treino", c, {
    width: 210,
    size: 17,
  }));
  add(rect("error-card", x + 32, y + 140, 326, 256, c, {
    stroke: c.error,
    strokeWidth: 2,
  }));
  add(ellipse("error-icon", x + 154, y + 172, 82, 82, c, {
    fill: c.elevated,
    stroke: c.error,
  }));
  add(text("error-symbol", x + 180, y + 188, "!", c, {
    width: 30,
    size: 42,
    align: "center",
    color: c.error,
  }));
  add(text("error-title", x + 62, y + 278, "JSON invalido", c, {
    width: 266,
    size: 24,
    align: "center",
    color: c.error,
  }));
  add(
    text(
      "error-copy",
      x + 62,
      y + 318,
      "Nao encontramos workout_plan.routines. Verifique o arquivo e tente novamente.",
      c,
      { width: 266, size: 14, align: "center", color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(rect("error-details", x + 32, y + 430, 326, 132, c));
  add(
    text(
      "error-details-copy",
      x + 56,
      y + 454,
      "Detalhe tecnico\nCampo obrigatorio ausente:\nworkout_plan.routines",
      c,
      { width: 260, size: 15, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(button("try-again", x + 32, y + 620, 326, "Escolher outro arquivo", c));
  add(button("download-template-error", x + 32, y + 690, 326, "Baixar modelo", c, "info"));
  add(nav(x, y, c, "Treino"));
}

function screen12(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-12 Baixar modelo JSON v2", c), header(x, y, c, "Modelo JSON", "Dados locais"));
  add(rect("model-card", x + 32, y + 160, 326, 252, c));
  add(ellipse("model-icon", x + 154, y + 190, 82, 82, c, {
    fill: c.elevated,
    stroke: c.info,
  }));
  add(text("model-title", x + 62, y + 294, "Modelo para gerar treino", c, {
    width: 266,
    size: 21,
    align: "center",
  }));
  add(
    text(
      "model-copy",
      x + 62,
      y + 330,
      "Sem treino ativo: acesso pela Home. Com treino ativo: acesso por Ajustes.",
      c,
      { width: 266, size: 14, align: "center", color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(button("download-template", x + 48, y + 450, 294, "Baixar JSON modelo", c));
  add(button("share-template", x + 48, y + 520, 294, "Compartilhar modelo", c, "info"));
  add(rect("model-steps", x + 32, y + 612, 326, 110, c));
  add(
    text(
      "model-steps-copy",
      x + 56,
      y + 636,
      "1. Baixe o modelo\n2. Gere um treino novo\n3. Importe o JSON final",
      c,
      { width: 260, size: 15, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(nav(x, y, c, "Ajustes"));
}

function screen13(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "UX-13 Configuracoes v2", c), header(x, y, c, "Ajustes", "v0.1.0"));
  add(rect("theme-settings", x + 32, y + 148, 326, 120, c));
  add(text("theme-title", x + 56, y + 170, "Tema do app", c, { width: 160, size: 20 }));
  add(text("theme-copy", x + 56, y + 202, "Preferencia salva no aparelho", c, {
    width: 220,
    size: 14,
    color: c.muted,
  }));
  add(rect("theme-dark", x + 56, y + 232, 118, 32, c, {
    fill: c.primary,
    stroke: c.primary,
  }));
  add(text("theme-dark-label", x + 78, y + 240, "Escuro", c, {
    width: 74,
    size: 13,
    align: "center",
    color: c.inkOnPrimary,
  }));
  add(rect("theme-light", x + 184, y + 232, 118, 32, c, { fill: "transparent" }));
  add(text("theme-light-label", x + 206, y + 240, "Claro", c, {
    width: 74,
    size: 13,
    align: "center",
    color: c.text,
  }));
  add(rect("json-settings", x + 32, y + 298, 326, 224, c, { stroke: c.info }));
  add(text("json-title", x + 56, y + 322, "Treino e JSON", c, {
    width: 180,
    size: 20,
    color: c.info,
  }));
  add(
    text(
      "json-copy",
      x + 56,
      y + 356,
      "Com plano ativo, baixar modelo e importar novo treino ficam aqui. Importar abre o seletor direto.",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(button("settings-download-model", x + 56, y + 416, 126, "Modelo", c, "info"));
  add(button("settings-import-json", x + 196, y + 416, 126, "Importar", c));
  add(button("settings-replace-plan", x + 56, y + 476, 266, "Substituir treino atual", c, "secondary"));
  add(rect("data-settings", x + 32, y + 552, 326, 112, c));
  add(text("data-title", x + 56, y + 574, "Dados locais", c, { width: 180, size: 18 }));
  add(
    text(
      "data-copy",
      x + 56,
      y + 608,
      "Exportar backup\nImportar backup\nHistorico preservado localmente",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.4 },
    ),
  );
  add(
    text("about-copy", x + 56, y + 672, "App offline-first | Sem conta ou servidor", c, {
      width: 260,
      size: 14,
      color: c.muted,
    }),
  );
  add(button("danger-clear", x + 48, y + 700, 294, "Apagar dados locais", c, "danger"));
  add(nav(x, y, c, "Ajustes"));
}

function screen14(index) {
  const [x, y] = pos(index);
  const c = light;
  add(phoneFrame(x, y, "UX-14 Tema claro", c, { light: true }), header(x, y, c, "Meu Treino", "Tema claro"));
  add(rect("light-plan-card", x + 32, y + 148, 326, 118, c));
  add(text("light-plan-title", x + 56, y + 170, "Hipertrofia 4x", c, {
    width: 180,
    size: 21,
  }));
  add(
    text("light-plan-subtitle", x + 56, y + 203, "7 de 16 treinos concluidos", c, {
      width: 230,
      size: 15,
      color: c.muted,
    }),
  );
  add(progressBar("light-cycle-progress", x + 56, y + 238, 220, 0.44, c, {
    fill: c.success,
  }));
  add(rect("light-next-card", x + 32, y + 298, 326, 246, c, {
    stroke: c.primary,
    strokeWidth: 2,
  }));
  add(pill("light-recommended", x + 56, y + 322, 130, "Recomendado", c));
  add(text("light-next-title", x + 56, y + 368, "Treino B\nSuperiores", c, {
    width: 200,
    size: 26,
    lineHeight: 1.12,
  }));
  add(
    text("light-next-meta", x + 56, y + 436, "42 min   6 exercicios\nDepois do Treino A", c, {
      width: 230,
      size: 15,
      color: c.muted,
      lineHeight: 1.35,
    }),
  );
  add(button("light-start-workout", x + 56, y + 488, 278, "Iniciar treino", c));
  add(rect("light-theme-note", x + 32, y + 574, 326, 132, c));
  add(
    text(
      "light-theme-note-text",
      x + 56,
      y + 598,
      "Mesma hierarquia do tema escuro\nAcao principal em azul\nProgresso em verde",
      c,
      { width: 268, size: 16, color: c.muted, lineHeight: 1.45 },
    ),
  );
  add(nav(x, y, c, "Inicio"));
}

function screen15(index) {
  const [x, y] = pos(index);
  const c = dark;
  add(phoneFrame(x, y, "V2 Fluxo corrigido", c), header(x, y, c, "Mapa v2", "Contrato UX"));
  add(rect("flow-home-empty", x + 32, y + 150, 326, 96, c, { stroke: c.info }));
  add(text("flow-home-empty-title", x + 56, y + 172, "Sem treino ativo", c, {
    width: 220,
    size: 19,
    color: c.info,
  }));
  add(text("flow-home-empty-copy", x + 56, y + 204, "Home mostra Importar e Modelo.\nImportar abre seletor de arquivo direto.", c, {
    width: 260,
    size: 14,
    color: c.muted,
    lineHeight: 1.35,
  }));
  add(rect("flow-home-active", x + 32, y + 274, 326, 126, c, { stroke: c.primary }));
  add(text("flow-home-active-title", x + 56, y + 296, "Com treino ativo", c, {
    width: 220,
    size: 19,
    color: c.primary,
  }));
  add(
    text(
      "flow-home-active-copy",
      x + 56,
      y + 328,
      "Home prioriza o proximo treino.\nJSON, modelo e troca de treino ficam em Ajustes.",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(rect("flow-workout-start", x + 32, y + 430, 326, 130, c, { stroke: c.warning }));
  add(text("flow-workout-start-title", x + 56, y + 452, "Iniciar treino", c, {
    width: 220,
    size: 19,
    color: c.warning,
  }));
  add(
    text(
      "flow-workout-start-copy",
      x + 56,
      y + 486,
      "UX-02 -> UX-03 primeiro.\nUsuario toca no exercicio que vai fazer; UX-04 abre esse item.",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(rect("flow-execution", x + 32, y + 590, 326, 122, c, { stroke: c.info }));
  add(text("flow-execution-title", x + 56, y + 612, "Execucao UX-04", c, {
    width: 220,
    size: 19,
    color: c.info,
  }));
  add(
    text(
      "flow-execution-copy",
      x + 56,
      y + 646,
      "Mostrar um exercicio por vez.\nDescanso fica em card dentro da UX-04.",
      c,
      { width: 260, size: 14, color: c.muted, lineHeight: 1.35 },
    ),
  );
  add(nav(x, y, c, "Inicio"));
}

[
  screen01,
  screen02,
  screen03,
  screen04,
  screen06,
  screen07,
  screen08,
  screen10,
  screen11,
  screen12,
  screen13,
  screen14,
  screen15,
].forEach((createScreen, index) => createScreen(index));

const excalidraw = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: {
    theme: "dark",
    viewBackgroundColor: "#111111",
    gridSize: null,
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 0.55 },
  },
  files: {},
};

await writeFile(outUrl, `${JSON.stringify(excalidraw, null, 2)}\n`, "utf8");
console.log(`Generated ${elements.length} elements in ${outUrl.pathname}`);
