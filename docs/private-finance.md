# Finanzas privadas

## Provisioning (manual, not performed)

The app uses the **external Supabase** client already used by AuthContext, not any other generated project client. Apply `supabase/migrations/20261120220000_private_finance.sql` manually to that project after reviewing it and verifying David's confirmed auth identity (`davidzarruk@gmail.com`). The migration fails closed if that identity does not exist. Do not automatically apply unrelated migrations. No bucket, public object, service key or broker credential is needed.

`finance_owners` contains only David's resolved UUID; authenticated clients cannot insert/update this allowlist. Every snapshot policy requires both `user_id = auth.uid()` and this allowlist membership. Email in the browser is only a UX gate; RLS is the authority. No ownership comes from imported JSON. Deletion/re-creation of the auth identity requires administrator re-provisioning. Do not add Laura or general authenticated access without a separate explicit authorization design.

Before production, test with actual separate owner, other-user and anonymous sessions: owner can select/upsert own row; other and anonymous cannot read or write it; forged `user_id` inserts/updates fail; allowlist modification fails. Local tests cover adapter scoping but cannot prove deployed RLS. Migration has not been run against a database.

## Private update workflow

1. Run trusted, read-only broker/MCP collectors **outside this public repository**. No trading endpoints. Keep original snapshots and credentials outside git, `public/`, `src/`, and `dist/`.
2. Normalize to the version-1 shape below. Reconcile balance scopes manually: never include a Binance main-wallet aggregate together with its included agentic/subaccount wallet. `balanceScope` is a stable unique economic account identifier (not a fetch/request identifier); duplicate scopes are rejected. Overlap under different IDs cannot be inferred by the UI. Broker NAV/BASE totals are reconciliation metadata, never cash or positions.
3. Sign in as David, visit `/finanzas`, choose local JSON, review sources, account ownership, FX exclusions and totals, then explicitly confirm replacement. File parsing does not upload anything; confirmation performs an RLS-protected upsert followed by readback verification. No localStorage, analytics or console logging is added for financial data.
4. “Volver a consultar” only retrieves the stored snapshot. Nothing contacts brokers automatically. Source times, snapshot `asOf` and server import time have distinct meanings. An old snapshot remains old after import. Error/unavailable-source balances are visible in original-currency detail but excluded from included totals. Missing FX is explicitly excluded, never assumed 1.

The reusable adapter is `createFinanceRepository` in `src/lib/financeRepository.ts`; collectors must not call it with privileged browser tokens. Normalized payloads must pass `snapshotSchema` before import. Current private source files are intentionally not embedded or referenced by the app.

## Exact normalized format

All objects are strict: extra fields, including `user_id` and credential fields, are rejected. Empty valid payload (no invented balances):

```json
{"version":1,"asOf":"2026-11-20T12:00:00Z","baseCurrency":"USD","fx":{},"sources":[],"accounts":[]}
```

Nonempty shape (TypeScript notation; placeholders, not financial examples):

```ts
type Snapshot = {
 version: 1;
 asOf: string; // ISO datetime with timezone
 baseCurrency: string; // one of the explicitly supported monetary currencies
 fx: Record<string, number>; // one unit of currency -> baseCurrency, positive finite;
 // omit baseCurrency itself; USD base with EUR: x means EUR amount * x -> USD
 sources: Array<{
  id: string; label: string; asOf: string;
  status: 'ok' | 'error' | 'unavailable'; message?: string;
 }>;
 accounts: Array<{
  id: string; label: string;
  ownership: 'laura' | 'joint' | 'david';
  sourceId: string; // references sources.id
  balanceScope: string; // unique underlying economic balance, stable across collectors
  holdings: Array<{
   symbol: string; name: string; assetClass: string;
   currency: string; // monetary valuation denomination, NOT asset ticker
   quantity: number; marketValue: number; // TOTAL signed position value, not unit price
   costBasis: number | null; // TOTAL signed cost; null if unknown
  }>;
  cash: Array<{currency: string; amount: number}>; // signed; negative debt retained
 }>;
};
```

Represent BTC/USDT/etc. as holdings valued in a monetary denomination such as USD, not a duplicate cash entry. Holding symbols are unique per account; aggregate same-symbol lots before import. Cash currencies, account IDs, scopes and source IDs must be unique in their respective scopes. Supported monetary currencies for base, holdings, cash and FX keys: USD, COP, EUR, GBP, CAD, CHF, JPY, AUD, NZD, MXN, BRL, CLP, PEN, ARS, CNY, HKD, SGD, INR, KRW, SEK, NOK, DKK, ZAR, AED. This is an explicit application subset, not every ISO currency. Crypto denominations/tickers (including BTC/ETH/USDT), unknown codes such as XYZ, summary aliases such as BASE, and lowercase codes are rejected. Numbers must be finite, magnitude <= 1e15; rates > 0. Limits: file 2 MB, 100 accounts/sources/cash currencies, 2,000 holdings per account. Missing FX is allowed only with explicit partial-total warnings. No historical return is computed: PnL is unrealized market value minus known cost, excludes unknown cost and unavailable FX/sources. Net allocation may be negative or exceed 100% with leverage.

## Validation boundaries

The SQL CHECK enforces only the envelope: a JSON object, an explicit numeric version equal to 1, no top-level user_id, and at most 2,000,000 bytes of PostgreSQL's JSONB text representation. Missing/null/string versions fail closed via COALESCE(..., false). It does **not** validate the full nested schema, supported currencies, duplicate scopes, or reconciliation. Full strict validation runs in the browser and repository on both input and readback; privileged/direct clients must apply the same schema. RLS is authorization, not full data validation.

The local file limit measures original file bytes; the SQL limit measures normalized JSONB text bytes (spacing/escaping may differ), so a file just below the local limit can still be rejected on save. These limits do not cap the HTTP request before PostgreSQL parses JSONB. The static SQL contract test does not execute PostgreSQL; real constraint and RLS validation remains a separate manual pre-deployment step.

## Verification

`npm ci --legacy-peer-deps --ignore-scripts` is needed because the existing lockfile omits Testing Library's DOM peer; no lockfile/dependency upgrade was made. UI tests use React DOM directly. Run `npm test`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`. No deployment, remote database changes, credential reads, commit or push is part of this implementation.
