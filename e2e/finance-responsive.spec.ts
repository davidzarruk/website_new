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
    await expect(page.getByRole('combobox')).toHaveValue('USD');
    await expect(page.getByRole('region', { name: 'Tabla consolidada de activos' })).toBeVisible();
    await expect(page.locator('.recharts-pie-sector')).toHaveCount(4);
    await page.getByText('Fuentes, advertencias y detalle por ubicación', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Consolidado · todas las cuentas' })).toBeVisible();
    await expectContained(page);
  });

  test(`economic assets consolidate by default with accessible chart legends at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?state=portfolio');
    await expect(page.locator('table')).toHaveCount(1);
    await expect(page.locator('tbody tr')).toHaveCount(5);
    for (const symbol of ['BTC', 'ETH', 'SPY', 'QQQ']) {
      await expect(page.locator('tbody tr').filter({ has: page.getByText(symbol, { exact: true }) })).toHaveCount(1);
    }
    await expect(page.locator('tbody tr').filter({ has: page.getByText('BTC', { exact: true }) })).toContainText('Parcial · solo costo conocido');
    await expect(page.getByRole('region', { name: 'Distribución por activo', exact: true }).getByRole('listitem')).toHaveCount(5);
    const currencies = page.getByRole('region', { name: 'Distribución por moneda', exact: true });
    await expect(currencies.getByRole('listitem')).toHaveCount(2);
    await expect(currencies.getByRole('listitem').filter({ has: page.getByText('EUR', { exact: true }) })).toContainText('1.650,00');
    const custody = page.getByRole('region', { name: 'País de custodia', exact: true });
    await expect(custody).toContainText('Sin país informado');
    await expect(custody).toContainText('No representa exposición económica');
    await expect(custody.getByRole('listitem')).toHaveCount(2);
    await expect(custody.getByRole('listitem').filter({ hasText: 'CH' })).toContainText('3.450,00');
    await expect(page.locator('.recharts-pie-sector')).toHaveCount(12);
    await expectContained(page);
    expect(await page.locator('details').evaluateAll(nodes => nodes.every(n => !n.hasAttribute('open')))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`consolidated-${width}.png`), fullPage: true });
    await page.getByRole('combobox').selectOption('EUR');
    await expect(page.getByText('Valor neto incluido · EUR', { exact: true })).toBeVisible();
    await expect(currencies.getByRole('listitem').filter({ has: page.getByText('EUR', { exact: true }) })).toContainText('1.500,00');
    await page.getByRole('combobox').selectOption('COP');
    await expect(currencies.getByRole('listitem').filter({ has: page.getByText('EUR', { exact: true }) })).toContainText(/6\.600\.000(?:,00)?$/);
    await expect(custody.getByRole('listitem').filter({ hasText: 'CH' })).toContainText(/13\.800\.000(?:,00)?$/);
    await expectContained(page);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await expectContained(page);
    expect(errors).toEqual([]);
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
