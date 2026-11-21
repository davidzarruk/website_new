import { expect, it } from 'vitest';
import { aggregateAssets } from './financeAssets';
import type { Snapshot } from './finance';
const h = (symbol: string, currency = 'USD', costBasis: number | null = 5) => ({
  symbol,
  name: symbol,
  assetClass: 'Inversión',
  currency,
  quantity: 1,
  marketValue: 10,
  costBasis,
});
const snapshot = (holdings = [h('BTC')]): Snapshot => ({
  version: 1,
  asOf: '2026-11-20T00:00:00Z',
  baseCurrency: 'USD',
  fx: { EUR: 2 },
  sources: [
    { id: 's', label: 'Synthetic', status: 'ok', asOf: '2026-11-20T00:00:00Z' },
  ],
  accounts: [0, 1].map((i) => ({
    id: `${i}`,
    label: `Synthetic ${i}`,
    balanceScope: `${i}`,
    ownership: 'joint',
    sourceId: 's',
    holdings: holdings as Snapshot['accounts'][number]['holdings'],
    cash: [],
  })),
});
it('consolidates exact crypto aliases and identical ETF symbols, not different funds', () => {
  const s = snapshot([
    h('BTC'),
    h('BTC CRYPTO'),
    h('ETH'),
    h('CRYPTO/ETH'),
    h('SPY'),
    h('QQQ'),
    h('EIMI'),
    h('VWCE'),
  ]);
  const v = aggregateAssets(s);
  expect(v.assets.map((a) => a.symbol).sort()).toEqual([
    'BTC',
    'EIMI',
    'ETH',
    'QQQ',
    'SPY',
    'VWCE',
  ]);
  expect(v.assets.find((a) => a.symbol === 'BTC')).toMatchObject({
    quantity: 4,
    value: 40,
  });
  expect(v.assets.find((a) => a.symbol === 'SPY')).toMatchObject({
    quantity: 2,
    value: 20,
  });
});
it('converts currencies to USD and keeps partial costs explicit, signed debt and exclusions', () => {
  const s = snapshot([h('SPY', 'EUR'), h('OTHER', 'GBP')]);
  s.accounts[1].holdings = [
    h('SPY', 'USD', null) as Snapshot['accounts'][number]['holdings'][number],
  ];
  s.accounts[0].cash = [{ currency: 'USD', amount: -7 }];
  const v = aggregateAssets(s);
  expect(v.assets.find((a) => a.symbol === 'SPY')).toMatchObject({
    value: 30,
    quantity: 2,
    pnl: 10,
    knownCost: 1,
    unknownCost: 1,
    costStatus: 'partial',
  });
  expect(v.total).toBe(23);
  expect(v.debt).toBe(7);
  expect(v.excludedCount).toBe(1);
  expect(v.exclusions).toContain('FX GBP → USD no disponible');
  s.sources[0].status = 'unavailable';
  expect(aggregateAssets(s)).toMatchObject({
    total: 0,
    debt: 0,
    excludedCount: 4,
  });
});
it('keeps unrecognized symbols literal, including dictionary keys and cash-like labels', () => {
  const s = snapshot([
    h('__proto__'),
    h('constructor'),
    h('crypto/btc'),
    h('Efectivo USD'),
  ]);
  s.accounts[0].cash = [{ currency: 'USD', amount: 3 }];
  const v = aggregateAssets(s);
  expect(v.assets.map((a) => a.symbol)).toEqual(
    expect.arrayContaining(['__proto__', 'constructor', 'crypto/btc'])
  );
  expect(v.assets.filter((a) => a.symbol === 'Efectivo USD')).toHaveLength(2);
  expect(
    v.assets.find((a) => a.assetClass === 'Efectivo / deuda')
  ).toMatchObject({ quantity: 3, value: 3 });
});
it('preserves original denomination and explicit custody across accounts before display conversion', () => {
 const s = snapshot([h('SPY', 'EUR')]);
 s.fx.COP = 0.00025;
 s.accounts[0].custodyCountry = 'CH';
 s.accounts[0].cash = [{ currency: 'USD', amount: 3 }, { currency: 'EUR', amount: -2 }];
 s.accounts[1].holdings = [h('SPY') as Snapshot['accounts'][number]['holdings'][number]];
 // The same economic instrument must retain both location and denomination.
 expect(aggregateAssets(s)).toMatchObject({
  currencies: [{ name: 'EUR', value: 20 }, { name: 'USD', value: 13 }],
  custodyCountries: [{ name: 'CH', value: 23 }, { name: 'Sin país informado', value: 10 }],
  debt: 4,
 });
 expect(aggregateAssets(s, 'COP').currencies).toEqual([{ name: 'EUR', value: 80000 }, { name: 'USD', value: 52000 }]);
 expect(aggregateAssets(s, 'EUR').custodyCountries).toEqual([{ name: 'CH', value: 11.5 }, { name: 'Sin país informado', value: 5 }]);
 s.accounts[1].custodyCountry = 'unknown';
 expect(aggregateAssets(s).custodyCountries[1].name).toBe('Sin país informado');
 s.fx = {};
 expect(aggregateAssets(s).currencies).toEqual([{ name: 'USD', value: 13 }]);
 s.sources[0].status = 'error';
 expect(aggregateAssets(s)).toMatchObject({ currencies: [], custodyCountries: [] });
});
it('excludes non-finite conversions rather than producing infinite totals', () => {
  const s = snapshot([h('SPY', 'EUR')]);
  s.fx = { EUR: 1e15 };
  s.accounts[0].holdings[0].marketValue = 1e15;
  // A supported display currency with a finite but tiny positive FX rate.
  s.fx.GBP = Number.MIN_VALUE;
  expect(aggregateAssets(s, 'GBP')).toMatchObject({
    total: 0,
    excludedCount: 2,
  });
});
it('defaults to USD even when the snapshot base is EUR and never invents missing base FX', () => {
  const s = snapshot([h('SPY', 'EUR')]);
  s.baseCurrency = 'EUR';
  s.fx = { USD: 0.5 };
  expect(aggregateAssets(s).total).toBe(40);
  s.fx = {};
  expect(aggregateAssets(s)).toMatchObject({ total: 0, excludedCount: 2 });
});
