import { snapshotSchema } from '../../src/lib/finance';

// Entirely synthetic, including the fake identity; email matches the existing
// presentation gate. The production authorization code is not changed.
const user = { id: 'synthetic-layout-owner', email: 'davidzarruk@gmail.com' };
export const useAuth = () => ({ user, loading: false, signOut: async () => {} });

export const syntheticSnapshot = snapshotSchema.parse({
  version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: {},
  sources: [{ id: 'synthetic', label: 'SyntheticSource'.repeat(8), asOf: '2026-11-20T12:00:00Z', status: 'ok', message: 'SyntheticMessage'.repeat(18) }],
  accounts: [{
    id: 'synthetic-account', label: 'SyntheticAccount'.repeat(7), ownership: 'joint', sourceId: 'synthetic', balanceScope: 'synthetic-scope',
    holdings: [{ symbol: 'SYNTHETIC', name: 'SyntheticHolding'.repeat(7), assetClass: 'SyntheticClass'.repeat(8), currency: 'USD', quantity: 1, marketValue: 1e15, costBasis: null }],
    cash: [{ currency: 'USD', amount: -1e15 }],
  }],
});

export const syntheticPortfolio = snapshotSchema.parse({
  version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: { EUR: 1.1, COP: 0.00025 },
  sources: [{ id: 'synthetic', label: 'Fuente de prueba', asOf: '2026-11-20T12:00:00Z', status: 'ok' }],
  accounts: [0, 1].map(i => ({
    custodyCountry: i ? undefined : 'CH',
    id: `synthetic-${i}`, label: `Cuenta de prueba ${i}`, ownership: 'joint', sourceId: 'synthetic', balanceScope: `scope-${i}`,
    holdings: [
      { symbol: i ? 'CRYPTO/BTC' : 'BTC', name: 'Bitcoin', assetClass: 'Cripto', currency: 'USD', quantity: 0.01, marketValue: 1000, costBasis: i ? null : 800 },
      { symbol: i ? 'CRYPTO/ETH' : 'ETH', name: 'Ethereum', assetClass: 'Cripto', currency: 'USD', quantity: 0.1, marketValue: 300, costBasis: null },
      { symbol: 'SPY', name: 'S&P 500 · SPY', assetClass: 'ETF', currency: i ? 'EUR' : 'USD', quantity: 3, marketValue: 1500, costBasis: 1200 },
      { symbol: 'QQQ', name: 'Nasdaq · QQQ', assetClass: 'ETF', currency: 'USD', quantity: 1, marketValue: 400, costBasis: null },
    ],
    cash: [{ currency: 'USD', amount: i ? -50 : 250 }],
  })),
});

export const supabase = {
  auth: { getUser: async () => ({ data: { user }, error: null }) },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => {
    const state = new URLSearchParams(location.search).get('state');
    if (state === 'error') return { data: null, error: { message: 'Synthetic offline error' } };
    const snapshot = state === 'portfolio' ? syntheticPortfolio : syntheticSnapshot;
    return { data: ['loaded', 'portfolio'].includes(state ?? '') ? { snapshot, imported_at: snapshot.asOf } : null, error: null };
  } }) }) }),
};
