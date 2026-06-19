import { expect, type Page, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const auditDir = "test-results/auditoria-entrega";

const cycleCompletePlan = {
  workout_plan: {
    plan_id: "plano-ciclo-curto",
    name: "Ciclo curto",
    objective: "Validar ciclo concluído",
    level: "iniciante",
    estimated_duration_weeks: 1,
    days_per_week: 1,
    routines: [
      {
        routine_id: "treino-unico",
        name: "Treino único",
        order: 1,
        warmup: [
          {
            type: "warmup",
            activity: "Mobilidade",
            duration_minutes: 5,
          },
        ],
        exercises: [
          {
            exercise_id: "agachamento-livre",
            name: "Agachamento livre",
            muscle_group: "Pernas",
            equipment: "Barra",
            is_unilateral: false,
            sets: 2,
            target_reps: "8",
            target_rir: 2,
            rest_seconds: 45,
          },
        ],
        cooldown: [],
      },
    ],
  },
};

test("mobile visual regression covers first use, import, active home, settings and workout detail", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Meu Treino" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Importe seu treino para começar" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Importar JSON" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar prompt" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Início" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await assertMobileUsability(page);

  await screenshot(page, "05-ux-01-primeiro-uso.png");

  await importModelPlan(page);
  await expect(
    page.getByRole("heading", { name: "Preview do JSON" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar importação" }),
  ).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "06-ux-10-preview-json.png");

  await page.getByRole("button", { name: "Confirmar importação" }).click();

  await expect(page.getByText("Próximo treino")).toBeVisible();
  await expect(page.getByText("Treino A - Peito e triceps")).toBeVisible();
  await expect(page.getByText("Comece pela primeira rotina")).toBeVisible();
  await expect(page.getByRole("button", { name: "Importar JSON" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Baixar prompt" })).toHaveCount(0);
  await assertMobileUsability(page);

  await screenshot(page, "07-home-ativa-sem-json.png");

  await page.getByRole("button", { name: "Ajustes" }).click();
  await expect(
    page.getByRole("heading", { name: "Preferências locais" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Substituir treino atual" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar prompt" })).toBeVisible();
  await expect(page.getByText("0.1.0")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Baixar modelo" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("meu-treino-modelo.json");

  const promptDownloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Baixar prompt" }).click();
  const promptDownload = await promptDownloadPromise;
  expect(promptDownload.suggestedFilename()).toBe("prompt-treino-modelo.md");

  await page.getByRole("radio", { name: "Claro" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("light")),
    )
    .toBe(true);
  await assertMobileUsability(page);

  await screenshot(page, "12-ux-13-ajustes-tema-claro.png");

  await replacePlanFromSettings(page);
  await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();

  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await expect(page.getByText("Toque no exercício disponível")).toHaveCount(0);
  await expect(
    page.getByText("Sem botão global: toque no exercício que você vai fazer agora."),
  ).toHaveCount(0);
  await expect(page.getByText("Aquecimento")).toBeVisible();
  await expect(page.getByText(/Exerc.cios do treino/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Abrir/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Supino reto/ })).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "09-ux-03-detalhe-treino.png");

  await page.getByRole("button", { name: "Treino" }).click();
  await expect(
    page.getByRole("heading", { name: "Escolha uma rotina" }),
  ).toBeVisible();
  await expect(page.getByText("Recomendado")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Treino B - Costas e biceps/ }),
  ).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "16-treino-lista-rotinas.png");

  await page
    .getByRole("button", { name: /Treino B - Costas e biceps/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Treino B - Costas e biceps" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Remada curvada/ }).click();
  await expect(
    page.getByRole("heading", { name: "Treino em andamento" }),
  ).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

test("active workout keeps bottom nav hidden and shows integrated rest, finish and history states", async ({
  page,
}) => {
  await page.goto("/");
  await importPlanFromObject(page, cycleCompletePlan, "ciclo-curto.json");
  await page.getByRole("button", { name: "Confirmar importação" }).click();

  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await page.getByRole("button", { name: /Agachamento livre/ }).click();

  await expect(
    page.getByRole("heading", { name: "Treino em andamento" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /S.rie 1 de 2/ })).toBeVisible();
  await expect(page.getByLabel("Aumentar RIR")).toHaveCount(0);
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);

  await page.getByRole("button", { name: /S.rie conclu.da/ }).click();

  await expect(page.getByText(/Descanso ap.s s.rie/)).toBeVisible();
  await expect(page.getByRole("button", { name: "+30s" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Pr.xima s.rie/ })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);

  await screenshot(page, "13-ux-04-descanso-integrado.png");

  await page.getByRole("button", { name: /Pr.xima s.rie/ }).click();
  await page.getByRole("button", { name: /S.rie conclu.da/ }).click();
  await expect(
    page.getByRole("heading", { name: "Registrar resultado" }),
  ).toBeVisible();

  await page.getByLabel("Aumentar Carga").click();
  await page.getByLabel("Aumentar Carga").click();
  await page.getByLabel("Aumentar Reps").click();
  await page.getByLabel("Aumentar Reps").click();
  await page.getByRole("button", { name: /Concluir exerc.cio/ }).click();

  await expect(page.getByText("Exercício concluído")).toBeVisible();
  await page.getByRole("button", { name: "Finalizar rotina" }).click();

  await expect(page.getByText("Treino concluído")).toBeVisible();
  await expect(page.getByText("Ciclo concluído")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);

  await screenshot(page, "10-ux-06-finalizacao.png");

  await page.getByRole("button", { name: "Ver histórico" }).click();
  await expect(page.getByRole("heading", { name: "Seu progresso" })).toBeVisible();
  await expect(page.getByText("Ciclo concluído")).toBeVisible();
  await expect(page.getByRole("button", { name: /Agachamento livre/ })).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "11-ux-07-08-historico.png");

  await page.getByRole("button", { name: /Agachamento livre/ }).click();
  await expect(
    page.getByRole("heading", { name: "Agachamento livre" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Registros recentes" }),
  ).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "14-ux-08-detalhe-exercicio.png");

  await page.getByRole("button", { name: "Início" }).click();
  await expect(page.getByText("Ciclo concluído")).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "15-ux-ciclo-concluido.png");
});

test("invalid import shows the dedicated recovery screen", async ({ page }) => {
  await page.goto("/");

  await importPlanFromObject(page, { invalid: true }, "treino-invalido.json");

  await expect(
    page.getByRole("heading", { name: "JSON não importado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Escolher outro arquivo" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar prompt" })).toBeVisible();
  await assertMobileUsability(page);

  await screenshot(page, "08-ux-11-erro-importacao.png");
});

test("settings clears local workout data after confirmation", async ({ page }) => {
  await page.goto("/");
  await importModelPlan(page);
  await page.getByRole("button", { name: "Confirmar importação" }).click();
  await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("button", { name: "Apagar dados locais" }).click();
  await expect(
    page.getByText("Apagar todos os dados de treino?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar limpeza" }).click();

  await expect(
    page.getByRole("heading", { name: "Importe seu treino para começar" }),
  ).toBeVisible();
  await expect(
    page.getByText("Dados de treino apagados deste dispositivo."),
  ).toBeVisible();
  await assertMobileUsability(page);
});

async function importModelPlan(page: Page) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /Importar JSON|Substituir treino atual/ }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles("src/assets/meu-treino-modelo.json");
}

async function importPlanFromObject(page: Page, plan: unknown, fileName: string) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /Importar JSON|Substituir treino atual/ }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles({
    name: fileName,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(plan)),
  });
}

async function replacePlanFromSettings(page: Page) {
  const settingsFileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Substituir treino atual" }).click();
  const settingsFileChooser = await settingsFileChooserPromise;

  await settingsFileChooser.setFiles("src/assets/meu-treino-modelo.json");
  await expect(
    page.getByRole("heading", { name: "Preview do JSON" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar importação" }).click();
}

async function screenshot(page: Page, fileName: string) {
  await mkdir(auditDir, { recursive: true });
  await page.screenshot({
    path: `${auditDir}/${fileName}`,
    fullPage: true,
  });
}

async function assertMobileUsability(page: Page) {
  await assertNoHorizontalOverflow(page);
  await assertBottomNavDoesNotCoverActionableContent(page);
}

async function assertNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
}

async function assertBottomNavDoesNotCoverActionableContent(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const nav = document.querySelector("nav[aria-label='Navegação principal']");

        if (!nav) {
          return true;
        }

        const initialScrollX = window.scrollX;
        const initialScrollY = window.scrollY;
        const actionableElements = Array.from(
          document.querySelectorAll<HTMLElement>("button, a, input, textarea, select"),
        ).filter((element) => {
          if (nav.contains(element)) {
            return false;
          }

          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          return (
            !element.classList.contains("sr-only") &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0
          );
        });

        const isSafe = actionableElements.every((element) => {
          element.scrollIntoView({ block: "center", inline: "nearest" });

          const navRect = nav.getBoundingClientRect();
          const rect = element.getBoundingClientRect();

          return rect.bottom <= navRect.top;
        });

        window.scrollTo(initialScrollX, initialScrollY);

        return isSafe;
      }),
    )
    .toBe(true);
}
