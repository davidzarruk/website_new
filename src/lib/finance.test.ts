import { describe, it, expect } from 'vitest';
import { snapshotSchema, summarize } from './finance';
const account = { id: 'test-only', label: 'Prueba sintética', ownership: 'laura', sourceId: 'broker', balanceScope: 'unique', holdings: [{ symbol: 'TEST', name: 'Prueba', assetClass: 'Acciones', currency: 'EUR', quantity: 2, marketValue: 100, costBasis: 80 }], cash: [{ currency: 'USD', amount: -10 }] };
it('converts positions and negative cash once and labels unrealized pnl', () => {
    const s = snapshotSchema.parse({ ...emptySnapshot, fx: { EUR: 2 }, sources: [{ id: 'broker', label: 'Prueba', asOf: emptySnapshot.asOf, status: 'ok' }], accounts: [account] });
    expect(summarize(s).total).toBe(190);
    expect(summarize(s).cash).toBe(-10);
    expect(summarize(s).pnl).toBe(40);
});
it('excludes missing FX rather than inventing a rate', () => {
    const result = summarize(snapshotSchema.parse({ ...emptySnapshot, sources: [{ id: 'broker', label: 'Prueba', asOf: emptySnapshot.asOf, status: 'ok' }], accounts: [account] }));
    expect(result.total).toBe(-10);
    expect(result.excluded).toContain('EUR');
});
it('rejects duplicate scopes, BASE summaries, invalid FX, unknown sources and nonfinite amounts', () => {
    const valid = { ...emptySnapshot, sources: [{ id: 'broker', label: 'Prueba', asOf: emptySnapshot.asOf, status: 'ok' }], accounts: [account] };
    for (const bad of [{ ...valid, accounts: [account, { ...account, id: 'second' }] }, { ...valid, fx: { USD: 2 } }, { ...valid, accounts: [{ ...account, cash: [{ currency: 'BASE', amount: 5 }] }] }, { ...valid, sources: [] }, { ...valid, fx: { EUR: Infinity } }, { ...valid, accounts: [{ ...account, cash: [{ currency: 'USD', amount: NaN }] }] }])
        expect(snapshotSchema.safeParse(bad).success).toBe(false);
});
export const emptySnapshot = { version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: {}, sources: [], accounts: [] };
it('keeps arbitrary asset classes numeric and cash separate without label collisions', () => {
 const classes = ['constructor', '__proto__', 'Efectivo', 'Efectivo (cash)'];
 const s = snapshotSchema.parse({...emptySnapshot, sources:[{id:'broker',label:'Test',asOf:emptySnapshot.asOf,status:'ok'}], accounts:[{...account, holdings:classes.map((assetClass,i)=>({...account.holdings[0],symbol:String(i),assetClass,currency:'USD',marketValue:i+1})),cash:[{currency:'USD',amount:5}]}]});
 const v=summarize(s);
 for (const [i,label] of classes.entries()) expect(v.allocation[label]).toBe(i+1);
 expect(Object.values(v.allocation).reduce((a,b)=>a+b,0)).toBe(15);
 expect(v.total).toBe(15);
});
describe('private snapshot schema' , () => {
    it('accepts an honest empty snapshot but rejects ownership fields', () => {
        expect(snapshotSchema.safeParse(emptySnapshot).success).toBe(true);
        expect(snapshotSchema.safeParse({ ...emptySnapshot, user_id: 'other' }).success).toBe(false);
    });
});
it('rejects crypto tickers and summary aliases in every monetary field', () => {
 for(const currency of ['BTC','ETH','XYZ','USDT','BASE','usd']) {
 const valid={...emptySnapshot,sources:[{id:'broker',label:'Test',asOf:emptySnapshot.asOf,status:'ok'}],accounts:[account]};
 for(const bad of [{...valid,baseCurrency:currency},{...valid,fx:{[currency]:2}},{...valid,accounts:[{...account,cash:[{currency,amount:1}]}]},{...valid,accounts:[{...account,holdings:[{...account.holdings[0],currency}]}]}]) expect(snapshotSchema.safeParse(bad).success).toBe(false);
 }
});
