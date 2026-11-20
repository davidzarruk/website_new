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

export const supabase = {
  auth: { getUser: async () => ({ data: { user }, error: null }) },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => {
    const state = new URLSearchParams(location.search).get('state');
    if (state === 'error') return { data: null, error: { message: 'Synthetic offline error' } };
    return { data: state === 'loaded' ? { snapshot: syntheticSnapshot, imported_at: syntheticSnapshot.asOf } : null, error: null };
  } }) }) }),
};
