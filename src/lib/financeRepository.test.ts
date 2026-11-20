import { it, expect, vi } from 'vitest';
import { createFinanceRepository, isFinanceOwner } from './financeRepository';
it.each(['load','save'] as const)('rejects identity switches during %s and pins readback to initiating UUID', async operation => {
 const snapshot={version:1,asOf:'2026-11-20T12:00:00Z',baseCurrency:'USD',fx:{},sources:[],accounts:[]};
 let uid='owner'; const ids:string[]=[];
 const client={auth:{getUser:async()=>({data:{user:{id:uid,email:'davidzarruk@gmail.com'}},error:null})},from:()=>({upsert:async()=>{uid='replacement';return {error:null};},select:()=>({eq:(_:string,id:string)=>{ids.push(id);return {maybeSingle:async()=>{uid='replacement';return {data:{snapshot,imported_at:snapshot.asOf},error:null};}};}})})};
 const repository=createFinanceRepository(client as never);
 await expect(operation==='load'?repository.load():repository.save(snapshot)).rejects.toThrow();
 expect(ids.every(id=>id==='owner')).toBe(true);
});
it('allows only David and scopes every request to verified auth identity, never payload ownership', async () => {
    expect(isFinanceOwner({ email: 'other@example.com' })).toBe(false);
    const eq = vi.fn().mockResolvedValue({ data: null, error: null });
    const select = vi.fn(() => ({ eq: (...args: unknown[]) => { eq(...args); return { maybeSingle: async () => ({ data: null, error: null }) }; } }));
    const client = { auth: { getUser: async () => ({ data: { user: { id: 'owner', email: 'davidzarruk@gmail.com' } }, error: null }) }, from: vi.fn(() => ({ select })) };
    expect(await createFinanceRepository(client as never).load()).toBeNull();
    expect(eq).toHaveBeenCalledWith('user_id', 'owner');
});
it('denies all database access to a different signed-in user', async () => {
    const client = { auth: { getUser: async () => ({ data: { user: { id: 'other', email: 'other@example.com' } }, error: null }) }, from: vi.fn() };
    await expect(createFinanceRepository(client as never).load()).rejects.toThrow();
    expect(client.from).not.toHaveBeenCalled();
});
it('imports with auth uid and verifies readback regardless of JSONB key order', async () => {
    const snapshot = { version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: { EUR: 2, COP: 0.1 }, sources: [], accounts: [] };
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { getUser: async () => ({ data: { user: { id: 'owner', email: 'davidzarruk@gmail.com' } }, error: null }) }, from: () => ({ upsert, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { snapshot: { ...snapshot, fx: { COP: 0.1, EUR: 2 } }, imported_at: snapshot.asOf }, error: null }) }) }) }) };
    await expect(createFinanceRepository(client as never).save(snapshot)).resolves.toBeTruthy();
    expect(upsert).toHaveBeenCalledWith({ user_id: 'owner', snapshot }, { onConflict: 'user_id' });
});
