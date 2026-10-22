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

test('the pip and accuracy show a wrong call as soon as it is made', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  await expect(page.getByText('Message 1 of 8')).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByText('Feinted')).toBeVisible();
  await expect(page.locator('.pip').first()).toHaveClass(/wrong/);
  await expect(page.locator('.meters')).toContainText('0 of 1 right');
  await page.getByRole('button', { name: /Rewind and try again/ }).click();
  await expect(page.locator('.pip').first()).toHaveClass(/now/);
});

test('the picker keeps the country after the field guide', async ({ page }) => {
  await page.goto('/');
  await page.locator('label', { hasText: 'Nigeria' }).click();
  await page.getByRole('button', { name: /field guide/i }).click();
  await page.getByRole('button', { name: /Back/ }).click();
  await expect(page.locator('label.selected')).toContainText('Nigeria');
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

test('only the face of the card that is showing can be used', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  await expect(page.getByRole('button', { name: 'Back to the message' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'send $400' })).toBeVisible();
  await page.getByRole('button', { name: 'Check first' }).click();
  await expect(page.getByRole('button', { name: 'Back to the message' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'send $400' })).toBeHidden();
  await page.getByRole('button', { name: 'Back to the message' }).click();
  await page.getByRole('button', { name: 'send $400' }).click();
  await expect(page.locator('.card-foot')).toHaveText('1 clue marked');
});

test('the wordmark leaves the round and keeps the country', async ({ page }) => {
  await page.goto('/?c=ng&s=42');
  await page.getByRole('button', { name: 'Leave the round and go back to the start' }).click();
  await expect(page.getByRole('heading', { name: /Spot the scam/ })).toBeVisible();
  await expect(page.locator('label.selected')).toContainText('Nigeria');
});

test('a message put right after a rewind shows as wrong straight away', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  await expect(page.getByText('Message 1 of 8')).toBeVisible();
  await page.keyboard.press('a');
  await page.getByRole('button', { name: /Rewind and try again/ }).click();
  await page.getByRole('button', { name: 'Ignore it' }).click();
  await expect(page.locator('.pip').first()).toHaveClass(/wrong/);
  await expect(page.locator('.meters')).toContainText('0 of 1 right');
  await page.getByRole('button', { name: /Next message/ }).click();
  await expect(page.locator('.pip').first()).toHaveClass(/wrong/);
  await expect(page.locator('.meters')).toContainText('0 of 1 right');
});
