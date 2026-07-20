import { expect, test } from "@playwright/test";

const itemId = "frame-item-frame-card-library";

test.beforeEach(async ({ page }) => {
  await page.goto("/editor");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId(itemId)).toBeVisible();
});

test("persists a snapped drag position into the preview", async ({ page }) => {
  const item = page.getByTestId(itemId);
  await item.scrollIntoViewIfNeeded();
  const box = await item.boundingBox();

  if (!box) throw new Error("Expected the canvas item to have a bounding box");

  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 172, box.y + 140);
  await page.mouse.up();

  const inspector = page.locator(".loom-studio-panel--inspector");
  await expect(inspector).toContainText("X120px");
  await expect(inspector).toContainText("Y104px");

  await page.getByRole("link", { name: "Preview" }).click();
  await expect(page).toHaveURL(/\/preview$/);
  await expect(page.getByTestId(itemId)).toHaveCSS("left", "120px");
  await expect(page.getByTestId(itemId)).toHaveCSS("top", "104px");
});
