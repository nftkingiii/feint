import { expect, test } from '@playwright/test';

// Many automated agents click the centre of an element's box. A phrase that
// wraps across lines as a plain inline span has a box whose centre can sit on
// a neighbouring phrase, so these tests check every phrase of every message.
for (const round of ['/?c=us&s=7', '/?c=ng&s=42', '/?c=gb&s=4242']) {
  test(`the centre of every phrase hits that phrase (${round})`, async ({ page }) => {
    await page.goto(round);
    for (let message = 1; message <= 8; message++) {
      await expect(page.getByText(`Message ${message} of 8`)).toBeVisible();
      const misses = await page.locator('.seg').evaluateAll(segs =>
        segs
          .map(seg => {
            const r = seg.getBoundingClientRect();
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return seg.contains(hit) ? null : seg.textContent.trim();
          })
          .filter(Boolean),
      );
      expect(misses, `message ${message}`).toEqual([]);
      await page.getByRole('button', { name: 'Ignore it' }).click();
      await page.getByRole('button', { name: /Next message|See your case file|Take the loss/ }).click();
    }
  });
}

test('clicking the centre of a clue marks it', async ({ page }) => {
  await page.goto('/?c=us&s=7');
  const clue = page.locator('.seg', { hasText: 'this is my new number' });
  const box = await clue.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.card-foot')).toHaveText('1 clue marked');
});

test('an unknown path still loads the game', async ({ page }) => {
  await page.goto('/zz');
  await expect(page.getByRole('heading', { name: /Spot the scam/ })).toBeVisible();
});
