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

  await expect(page.getByText("Proximo treino")).toBeVisible();
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
