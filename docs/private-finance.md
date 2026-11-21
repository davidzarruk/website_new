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
  custodyCountry?: string; // explicit ISO 3166-1 alpha-2 uppercase account/custody location, or 'unknown'
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

Represent BTC/USDT/etc. as holdings valued in a monetary denomination such as USD, not a duplicate cash entry. Holding symbols are unique per account; aggregate same-symbol lots before import. Cash currencies, account IDs, scopes and source IDs must be unique in their respective scopes. Supported monetary currencies for base, holdings, cash and FX keys: USD, COP, EUR, GBP, CAD, CHF, JPY, AUD, NZD, MXN, BRL, CLP, PEN, ARS, CNY, HKD, SGD, INR, KRW, SEK, NOK, DKK, ZAR, AED. This is an explicit application subset, not every ISO currency. Crypto denominations/tickers (including BTC/ETH/USDT), unknown codes such as XYZ, summary aliases such as BASE, and lowercase codes are rejected. Numbers must be finite, magnitude <= 1e15; rates > 0. Limits: file 2 MB, 100 accounts/sources/cash currencies, 2,000 holdings per account. Missing FX is allowed only with explicit partial-total warnings. No historical return is computed: PnL is unrealized market value minus known cost, excludes unknown cost and unavailable FX/sources. Signed debt remains in net totals. Donut allocation uses only positive consolidated asset values, never negative slices; gross negative balances are disclosed separately.

## Consolidated presentation

`aggregateAssets` (`src/lib/financeAssets.ts`) groups exact instrument symbols across all accounts. Only the explicit aliases `CRYPTO/BTC` → `BTC` and `CRYPTO/ETH` → `ETH` are normalized; names, classes and index exposure never determine identity. SPY stays separate from QQQ, EIMI, VWCE or any other instrument. Cash groups separately by original currency, with a collision-safe namespace.

Display defaults to USD independently of the snapshot base. Conversion uses `(currency → snapshot base) / (display currency → snapshot base)`; unavailable source or missing FX balances are excluded from both included quantities and money, with a partial-total warning. No conversion is invented. Per-asset PnL is explicitly partial when any costs/balances are missing, and unknown when none are known. Known-cost PnL is not investment performance.

The primary view has one value-sorted economic-asset table and four accessible donut/legend panels (asset, class, original monetary denomination, and **País de custodia**). Asset/class positive allocation is netted per economic asset first; gross signed negative balances remain disclosed separately. More than six positive categories are displayed as the five largest plus “Otros activos”; the complete holdings table remains available. Original-currency account/source details are collapsed, not the default organization. Import and preview still require explicit save confirmation.

Currency categories retain each holding/cash balance's original `currency` before converting amounts to the selected display currency through snapshot FX. This is reported monetary denomination, **not** inferred underlying economic/currency exposure (e.g. a USD-valued crypto holding remains USD-denominated here). Custody is exclusively the explicit account `custodyCountry`: uppercase ISO2 or `unknown`, optional for backward-compatible version-1 snapshots. Missing/unknown location is grouped as **Sin país informado**. It is account/custody location, **not** issuer domicile, nationality, or geographic economic exposure. Never derive it from broker names, owner, currency, or an instrument ticker. A Swiss account can hold non-Swiss assets.

Both new allocations net each economic asset within each dimension bucket, then sum only positive asset/bucket values. Negative slices are never drawn; debt stays in the signed net total and the separate gross debt disclosure. Their positive denominators can differ from asset/class charts when an instrument offsets across locations/currencies. Unavailable sources, missing FX and nonfinite conversions use the same exclusions as the consolidated table; unassigned countries are not excluded. Empty allocations show an explicit no-positive-values message. Legends show percentages and converted amounts; selecting USD/EUR/COP changes amounts, never original currency or custody labels.

## Validation boundaries

The SQL CHECK enforces only the envelope: a JSON object, an explicit numeric version equal to 1, no top-level user_id, and at most 2,000,000 bytes of PostgreSQL's JSONB text representation. Missing/null/string versions fail closed via COALESCE(..., false). It does **not** validate the full nested schema, supported currencies, duplicate scopes, or reconciliation. Full strict validation runs in the browser and repository on both input and readback; privileged/direct clients must apply the same schema. RLS is authorization, not full data validation.

The local file limit measures original file bytes; the SQL limit measures normalized JSONB text bytes (spacing/escaping may differ), so a file just below the local limit can still be rejected on save. These limits do not cap the HTTP request before PostgreSQL parses JSONB. The static SQL contract test does not execute PostgreSQL; real constraint and RLS validation remains a separate manual pre-deployment step.

## Verification

`npm ci --legacy-peer-deps --ignore-scripts` is needed because the existing lockfile omits Testing Library's DOM peer. UI tests use React DOM directly. Run `npm test`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`. No deployment, remote database changes, credential reads, commit or push is part of this implementation.

### Responsive browser regressions

Install the test browsers once with `npx playwright install chromium webkit`, then run `npm run test:responsive`. The isolated Vite server binds to `127.0.0.1:8796` and mounts the real Finanzas component/styles with test-only auth/client aliases in `e2e/finance-responsive/vite.config.ts`. Neither production authentication nor Supabase configuration is changed. All balances, labels and the owner ID in the harness are synthetic; no real session or backend is used. This harness is not a production build entry point.

The browser tests cover 320px/390px Chromium and iPhone-emulated WebKit layouts, empty/error/loaded/consolidated states, long labels and source messages, large signed currency values, and local import preview/discard at 200% text size. They assert document and card/control bounds without hidden overflow and verify that holdings tables scroll within their own container. Type-check the harness with `npx tsc --noEmit -p e2e/tsconfig.json`.
