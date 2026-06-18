import { expect, test } from "@playwright/test";

test("home shows the next recommended routine after importing the model plan", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Meu Treino" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Importe seu treino para comecar" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Importar JSON" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/05-ux-01-primeiro-uso.png",
    fullPage: true,
  });

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Importar JSON" }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles("src/assets/meu-treino-modelo.json");
  await expect(
    page.getByRole("heading", { name: "Preview do JSON" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar importacao" }),
  ).toBeVisible();

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/06-ux-10-preview-json.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "Confirmar importacao" }).click();

  await expect(page.getByText("Próximo treino")).toBeVisible();
  await expect(page.getByText("Treino A - Peito e triceps")).toBeVisible();
  await expect(page.getByText("Comece pela primeira rotina")).toBeVisible();
  await expect(page.getByRole("button", { name: "Importar JSON" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toHaveCount(0);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/07-home-ativa-sem-json.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "Ajustes" }).click();
  await expect(page.getByRole("heading", { name: /Prefer/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Substituir treino atual" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();
  await expect(page.getByText("0.1.0")).toBeVisible();

  await page.getByRole("radio", { name: "Claro" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("light")),
    )
    .toBe(true);

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/12-ux-13-ajustes-tema-claro.png",
    fullPage: true,
  });

  const settingsFileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Substituir treino atual" }).click();
  const settingsFileChooser = await settingsFileChooserPromise;

  await settingsFileChooser.setFiles("src/assets/meu-treino-modelo.json");
  await expect(
    page.getByRole("heading", { name: "Preview do JSON" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar importacao" }).click();
  await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();

  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await expect(
    page.getByRole("heading", { name: "Toque no exercício disponível" }),
  ).toBeVisible();
  await expect(page.getByText("Aquecimento")).toBeVisible();
  await expect(page.getByText("Exercícios do treino")).toBeVisible();
  await expect(page.getByRole("button", { name: /Abrir/ }).first()).toBeVisible();

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/09-ux-03-detalhe-treino.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: /Abrir/ }).first().click();
  await expect(
    page.getByRole("heading", { name: "Treino em andamento" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Registrar agora" })).toBeVisible();
});

test("invalid import shows the dedicated recovery screen", async ({ page }) => {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Importar JSON" }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles({
    name: "treino-invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"invalid": true}'),
  });

  await expect(
    page.getByRole("heading", { name: "JSON nao importado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Escolher outro arquivo" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Baixar modelo" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.screenshot({
    path: "docs/ajustes/auditoria-entrega/08-ux-11-erro-importacao.png",
    fullPage: true,
  });
});

test("settings clears local workout data after confirmation", async ({ page }) => {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Importar JSON" }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles("src/assets/meu-treino-modelo.json");
  await page.getByRole("button", { name: "Confirmar importacao" }).click();
  await expect(page.getByRole("button", { name: "Iniciar treino" })).toBeVisible();

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("button", { name: "Apagar dados locais" }).click();
  await expect(
    page.getByText("Apagar todos os dados de treino?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar limpeza" }).click();

  await expect(
    page.getByRole("heading", { name: "Importe seu treino para comecar" }),
  ).toBeVisible();
  await expect(
    page.getByText("Dados de treino apagados deste dispositivo."),
  ).toBeVisible();
});
