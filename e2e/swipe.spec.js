import { expect, test } from '@playwright/test';

// Nigeria seed 42: messages 1 and 2 are both scams (see docs/PRD.md).
const ROUND = '/?c=ng&s=42';

/** Drag the message card horizontally with the mouse, the way a person swipes. */
async function drag(page, distance) {
  const box = await page.locator('.card').boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + distance, y + 4, { steps: 12 });
  await page.mouse.up();
}

test('dragging right acts, dragging left ignores, and the round continues', async ({ page }) => {
  await page.goto(ROUND);
  await expect(page.getByText('Message 1 of 8')).toBeVisible();

  await drag(page, 220);
  await expect(page.locator('.stamp')).toHaveText('Feinted');
  await page.getByRole('button', { name: 'Take the loss' }).click();

  await expect(page.getByText('Message 2 of 8')).toBeVisible();
  await drag(page, -220);
  await expect(page.locator('.stamp')).toHaveText('Scam avoided');
  await page.getByRole('button', { name: /Next message/ }).click();
  await expect(page.getByText('Message 3 of 8')).toBeVisible();
});

test('a short drag springs back without deciding', async ({ page }) => {
  await page.goto(ROUND);
  await drag(page, 40);
  await expect(page.locator('.stamp')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Check first' })).toBeVisible();
});

test('a drag does not swallow the next tap on a clue', async ({ page }) => {
  await page.goto(ROUND);
  await drag(page, 40);
  await page.getByRole('button', { name: /0803/ }).click();
  await expect(page.locator('.card-foot')).toHaveText('1 clue marked');
});
