import { expect, test, type Page } from '@playwright/test';
import { syntheticSnapshot } from './finance-responsive/mocks';

async function expectContained(page: Page) {
  const layout = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const outside = [...document.querySelectorAll('main, header, section, input, select, button, [role="alert"], h2, p, strong, span')]
      // Holdings deliberately retain their natural width within a local scroller.
      .filter(element => !element.closest('table'))
      .flatMap(element => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewport + 1 || rect.left < -1
          ? [{ tag: element.tagName, text: element.textContent?.slice(0, 70), left: rect.left, right: rect.right }]
          : [];
      });
    const clipping = [...document.querySelectorAll('html, body, #root, main, main div, section, p')]
      .filter(element => ['hidden', 'clip'].includes(getComputedStyle(element).overflowX)
        && element.scrollWidth > element.clientWidth + 1)
      .map(element => element.tagName);
    return { viewport, width: document.documentElement.scrollWidth, outside, clipping };
  });
  expect(layout, JSON.stringify(layout)).toEqual({ viewport: layout.viewport, width: layout.viewport, outside: [], clipping: [] });
}

for (const width of [320, 390]) {
  test(`local JSON preview stays contained with enlarged text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?state=empty');
    await expect(page.getByText('Sin instantánea privada')).toBeVisible();
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.getByLabel('Archivo JSON privado').setInputFiles({
      name: `${'synthetic-long-filename-'.repeat(8)}.json`,
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(syntheticSnapshot)),
    });
    await expect(page.getByText('Vista previa local · aún no guardada')).toBeVisible();
    await expectContained(page);
    const scroller = page.locator('table').locator('..');
    expect(await scroller.evaluate(element => {
      element.scrollLeft = 100;
      return element.scrollWidth > element.clientWidth && element.scrollLeft > 0;
    })).toBe(true);
    await page.getByRole('button', { name: 'Descartar', exact: true }).click();
    await expect(page.getByText('Vista previa local · aún no guardada')).toHaveCount(0);
    await expectContained(page);
  });

  test(`loaded cards and controls fit while holdings scroll locally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?state=loaded');
    await expect(page.getByText('Datos al', { exact: false })).toBeVisible();
    await expectContained(page);
    const scrollers = await page.locator('table').evaluateAll(tables => tables.map(table => {
      const container = table.parentElement!;
      container.scrollLeft = 100;
      return { overflow: getComputedStyle(container).overflowX, scrollable: container.scrollWidth > container.clientWidth, moved: container.scrollLeft > 0 };
    }));
    expect(scrollers).toEqual([{ overflow: 'auto', scrollable: true, moved: true }]);
    await page.getByRole('combobox').selectOption('all');
    await expect(page.getByRole('heading', { name: 'Consolidado · todas las cuentas' })).toBeVisible();
    await expectContained(page);
  });

  test(`empty and error cards fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?state=error');
    await expect(page.getByRole('alert')).toContainText('No se pudo leer');
    await expectContained(page);
    await page.goto('/?state=empty');
    await expect(page.getByText('Sin instantánea privada')).toBeVisible();
    await expectContained(page);
  });
}
