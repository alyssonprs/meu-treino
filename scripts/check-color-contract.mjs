import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("src");
const sourceExtensions = new Set([".css", ".ts", ".tsx"]);
const ignoredFiles = new Set([
  path.join(sourceRoot, "app", "styles.css"),
  path.join(sourceRoot, "theme", "tokens.css"),
  path.join(sourceRoot, "theme", "theme.tsx"),
]);

const forbiddenPatterns = [
  {
    label: "alias de cor legado",
    pattern:
      /\b(?:bg|text|border|ring|fill|stroke)-(?:background|foreground|card|card-foreground|border|muted|muted-foreground|weak-foreground|primary|primary-foreground|secondary|secondary-foreground|success|info|info-foreground|warning|destructive|ring)(?:\/[^\s"'`]+)?\b/g,
  },
  {
    label: "cor fixa do Tailwind",
    pattern:
      /\b(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
  },
  {
    label: "cor hexadecimal fixa",
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    label: "cor rgb fixa",
    pattern: /\brgba?\(/g,
  },
  {
    label: "cor hsl fixa",
    pattern: /\bhsla?\(/g,
  },
];

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

const files = (await collectSourceFiles(sourceRoot)).filter(
  (file) => !ignoredFiles.has(file),
);
const violations = [];

for (const file of files) {
  const source = (await readFile(file, "utf8")).replaceAll(
    "bg-[hsl(var(--exercise-media-canvas))]",
    "",
  );

  for (const { label, pattern } of forbiddenPatterns) {
    pattern.lastIndex = 0;
    let match = pattern.exec(source);

    while (match) {
      violations.push({
        file: path.relative(process.cwd(), file),
        label,
        line: getLineNumber(source, match.index),
        value: match[0],
      });
      match = pattern.exec(source);
    }
  }
}

if (violations.length > 0) {
  console.error("Contrato de cores violado:");
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} ${violation.label}: ${violation.value}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("Contrato de cores aprovado.");
}
