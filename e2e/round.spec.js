import { expect, test } from '@playwright/test';

test('a rewind gives the savings back for the rest of the round', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  const savings = page.locator('.meters').getByText('$8,000');
  await expect(savings).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByText('Feinted')).toBeVisible();
  await page.getByRole('button', { name: /Rewind and try again/ }).click();
  await page.getByRole('button', { name: 'Ignore it' }).click();
  await page.getByRole('button', { name: /Next message/ }).click();
  await expect(page.getByText('Message 2 of 8')).toBeVisible();
  await expect(savings).toBeVisible();
});

test('every phrase of a message is a button', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  await page.getByRole('button', { name: 'send $400' }).click();
  await expect(page.locator('.card-foot')).toHaveText('1 clue marked');
});

test('after the round, the Play tab lists the messages again', async ({ page }) => {
  await page.goto('/?c=ng&s=42');
  for (let i = 0; i < 8; i++) {
    await page.getByRole('button', { name: 'Ignore it' }).click();
    await page.getByRole('button', { name: /Next message|See your case file|Take the loss/ }).click();
  }
  await page.getByRole('tab', { name: 'Play' }).click();
  await expect(page.getByRole('heading', { name: 'Your messages' })).toBeVisible();
  await expect(page.locator('.review-item')).toHaveCount(8);
});
