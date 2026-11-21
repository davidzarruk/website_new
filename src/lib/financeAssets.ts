import type { Snapshot } from './finance';

type CostStatus = 'known' | 'partial' | 'unknown' | 'not-applicable';
export type Asset = {
  key: string;
  symbol: string;
  name: string;
  assetClass: string;
  isCash: boolean;
  quantity: number;
  value: number;
  pnl: number;
  knownCost: number;
  unknownCost: number;
  included: number;
  excluded: number;
  costStatus: CostStatus;
  accounts: Set<string>;
};

/** Same-symbol instruments only; never infer identity from names or asset classes. */
export function aggregateAssets(
  s: Snapshot,
  base = 'USD',
  accounts = s.accounts
) {
  const assets = new Map<string, Asset>();
  // Net the same economic asset within each original denomination/location first.
  const currencyBuckets = new Map<string, Map<string, number>>();
  const custodyBuckets = new Map<string, Map<string, number>>();
  const addBucket = (buckets: Map<string, Map<string, number>>, name: string, key: string, value: number) => {
    const bucket = buckets.get(name) ?? new Map<string, number>();
    bucket.set(key, (bucket.get(key) ?? 0) + value);
    buckets.set(name, bucket);
  };
  const allocation = (buckets: Map<string, Map<string, number>>) => [...buckets]
    .map(([name, values]) => ({ name, value: [...values.values()].reduce((sum, value) => sum + Math.max(0, value), 0) }))
    .filter(entry => entry.value > 0);

  const exclusions = new Set<string>();
  const baseRate = base === s.baseCurrency ? 1 : s.fx[base];
  let debt = 0,
    includedTotal = 0,
    includedPnl = 0,
    positiveTotal = 0;
  const rate = (currency: string) => {
    const source = currency === s.baseCurrency ? 1 : s.fx[currency];
    const converted = source && baseRate ? source / baseRate : null;
    return converted !== null && Number.isFinite(converted) && converted > 0
      ? converted
      : null;
  };

  for (const account of accounts) {
    const available = s.sources.some(
      (source) => source.id === account.sourceId && source.status === 'ok'
    );
    const balances = [
      ...account.holdings.map((h) => ({ ...h, isCash: false })),
      ...account.cash.map((c) => ({
        symbol: `Efectivo ${c.currency}`,
        name: `Efectivo ${c.currency}`,
        assetClass: 'Efectivo / deuda',
        currency: c.currency,
        quantity: c.amount,
        marketValue: c.amount,
        costBasis: null,
        isCash: true,
      })),
    ];
    for (const holding of balances) {
      const { isCash } = holding;
      const symbol =
        holding.symbol === 'CRYPTO/BTC' || holding.symbol === 'BTC CRYPTO'
          ? 'BTC'
          : holding.symbol === 'CRYPTO/ETH' || holding.symbol === 'ETH CRYPTO'
            ? 'ETH'
            : holding.symbol;
      // Separate namespaces prevent collision with an actual cash-like instrument name.
      const key = `${isCash ? 'cash' : 'asset'}:${symbol}`;
      let asset = assets.get(key);
      if (!asset) {
        asset = {
          key,
          symbol,
          isCash,
          name:
            symbol === 'BTC'
              ? 'Bitcoin'
              : symbol === 'ETH'
                ? 'Ethereum'
                : holding.name,
          assetClass: holding.assetClass,
          quantity: 0,
          value: 0,
          pnl: 0,
          knownCost: 0,
          unknownCost: 0,
          included: 0,
          excluded: 0,
          costStatus: isCash ? 'not-applicable' : 'unknown',
          accounts: new Set(),
        };
        assets.set(key, asset);
      }
      asset.accounts.add(account.id);
      const fx = rate(holding.currency);
      const value = fx === null ? NaN : holding.marketValue * fx;
      const pnl =
        fx === null || holding.costBasis === null
          ? 0
          : (holding.marketValue - holding.costBasis) * fx;
      const validMoney =
        Number.isFinite(value) &&
        Number.isFinite(pnl) &&
        Number.isFinite(asset.value + value) &&
        Number.isFinite(asset.pnl + pnl) &&
        Number.isFinite(includedTotal + value) &&
        Number.isFinite(includedPnl + pnl) &&
        Number.isFinite(positiveTotal + Math.max(0, value)) &&
        Number.isFinite(debt + Math.max(0, -value));
      if (!available || fx === null || !validMoney) {
        asset.excluded++;
        exclusions.add(
          !available
            ? `${account.label}: fuente no disponible`
            : `FX ${holding.currency} → ${base} no disponible`
        );
        continue;
      }
      addBucket(currencyBuckets, holding.currency, key, value);
      addBucket(custodyBuckets, !account.custodyCountry || account.custodyCountry === 'unknown' ? 'Sin país informado' : account.custodyCountry, key, value);
      asset.included++;
      asset.quantity += holding.quantity;
      includedTotal += value;
      includedPnl += pnl;
      positiveTotal += Math.max(0, value);
      asset.value += value;
      // Gross signed liabilities, even when a consolidated asset nets to positive.
      if (value < 0) debt += -value;
      if (!isCash) {
        if (holding.costBasis === null) asset.unknownCost++;
        else {
          asset.knownCost++;
          asset.pnl += pnl;
        }
      }
    }
  }
  const rows = [...assets.values()];
  for (const a of rows) {
    if (!a.isCash)
      a.costStatus = a.knownCost
        ? a.unknownCost || a.excluded
          ? 'partial'
          : 'known'
        : 'unknown';
  }
  rows.sort((a, b) => b.value - a.value || a.symbol.localeCompare(b.symbol));
  return {
    assets: rows,
    currencies: allocation(currencyBuckets),
    custodyCountries: allocation(custodyBuckets),
    total: includedTotal,
    pnl: includedPnl,
    debt,
    exclusions: [...exclusions],
    excludedCount: rows.reduce((n, a) => n + a.excluded, 0),
  };
}
