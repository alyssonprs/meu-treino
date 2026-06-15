import { expect, test } from "@playwright/test";

test("home shows the next recommended routine after importing the model plan", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Meu Treino" })).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Importar JSON" }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles("src/assets/meu-treino-modelo.json");
  await expect(
    page.getByRole("heading", { name: "Preview do treino" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ativar novo plano" }).click();

  await expect(page.getByText("Proximo treino")).toBeVisible();
  await expect(page.getByText("Treino A - Peito e triceps")).toBeVisible();
  await expect(page.getByText("Comece pela primeira rotina")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.screenshot({
    path: "docs/prototipos/visual-home-mobile.png",
    fullPage: true,
  });
});
