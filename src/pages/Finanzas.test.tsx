import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, vi, afterEach } from 'vitest';
import Finanzas from './Finanzas';
import ProtectedRoute from '@/components/ProtectedRoute';
const state = vi.hoisted(() => ({ user: { id: 'owner', email: 'davidzarruk@gmail.com' } as {
        id: string;
        email: string;
    } | null, loading: false }));
const repo = vi.hoisted(() => ({ load: vi.fn().mockResolvedValue(null), save: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ ...state, signOut: vi.fn() }) }));
vi.mock('@/integrations/external-supabase/client', () => ({ supabase: {} }));
vi.mock('@/lib/financeRepository', async (importOriginal) => ({ ...await importOriginal<object>(), createFinanceRepository: () => repo }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: ReturnType<typeof createRoot>;
let div: HTMLDivElement;
afterEach(async () => { await act(async () => root?.unmount()); div?.remove(); state.user = { id: 'owner', email: 'davidzarruk@gmail.com' }; repo.load.mockReset().mockResolvedValue(null); repo.save.mockReset(); });
async function mount(child = <Finanzas />) { div = document.createElement('div'); document.body.append(div); root = createRoot(div); await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{child}</MemoryRouter>)); }
function deferred<T>() { let resolve!: (value:T)=>void; let reject!: (reason:Error)=>void; const promise=new Promise<T>((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject}; }
async function choose(text: Promise<string>) { const input=div.querySelector('input')!; Object.defineProperty(input,'files',{configurable:true,value:[{size:100,text:()=>text}]}); await act(async()=>input.dispatchEvent(new Event('change',{bubbles:true}))); }
const empty={version:1,asOf:'2026-11-20T12:00:00Z',baseCurrency:'USD',fx:{},sources:[],accounts:[]};
it('only the latest deferred file selection may publish a preview or error',async()=>{
 await mount();const old=deferred<string>();await choose(old.promise);await choose(Promise.resolve(JSON.stringify(empty)));
 expect(div.textContent).toContain('Vista previa local');
 await act(async()=>old.reject(new Error('stale file error')));
 expect(div.textContent).not.toContain('stale file error');
});
it('ignores a stale successful read after discard',async()=>{
 await mount();const old=deferred<string>();await choose(old.promise);await choose(Promise.resolve(JSON.stringify(empty)));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Descartar')!.click());
 await act(async()=>old.resolve(JSON.stringify(empty)));
 expect(div.textContent).not.toContain('Vista previa local');
});
it('labels included known-cost PnL and unavailable-source detail exclusions',async()=>{
 const source={id:'bad',label:'Test',asOf:empty.asOf,status:'unavailable'};
 repo.load.mockResolvedValueOnce({snapshot:{...empty,sources:[source],accounts:[{id:'test',label:'Test',ownership:'david',sourceId:'bad',balanceScope:'test',holdings:[],cash:[{currency:'USD',amount:2}]}]},importedAt:empty.asOf});
 await mount();expect(div.textContent).toContain('PnL incluido · costo conocido');
 expect(div.textContent).toContain('Detalle excluido de totales y PnL: fuente no disponible');
});
it('settles loading after StrictMode effect cleanup and restart',async()=>{ await mount(<StrictMode><Finanzas /></StrictMode>); expect(div.textContent).toContain('Sin instantánea privada'); });
it('keeps latest selection when older successful read completes last',async()=>{
 await mount();const old=deferred<string>();await choose(old.promise);await choose(Promise.resolve(JSON.stringify({...empty,baseCurrency:'EUR'})));
 await act(async()=>old.resolve(JSON.stringify(empty)));
 repo.save.mockResolvedValueOnce({snapshot:{...empty,baseCurrency:'EUR'},importedAt:empty.asOf});
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Confirmar'))!.click());
 expect(repo.save).toHaveBeenLastCalledWith({...empty,baseCurrency:'EUR'});
});
it('invalidates stale reads on save and serializes save against file selection and reload',async()=>{
 await mount();const old=deferred<string>();await choose(old.promise);await choose(Promise.resolve(JSON.stringify(empty)));
 const saved=deferred<{snapshot:typeof empty;importedAt:string}>();repo.save.mockReturnValueOnce(saved.promise);
 const calls=repo.load.mock.calls.length;
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Confirmar'))!.click());
 await choose(Promise.resolve('invalid while saving'));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Volver'))!.click());
 expect(repo.load.mock.calls.length).toBe(calls);
 await act(async()=>saved.resolve({snapshot:empty,importedAt:empty.asOf}));
 await act(async()=>old.resolve(JSON.stringify(empty)));
 expect(div.textContent).not.toContain('Vista previa local');expect(div.textContent).toContain('guardada y verificada');
});
it('does not publish deferred reads after identity unmount',async()=>{
 await mount();const old=deferred<string>();await choose(old.promise);state.user=null;
 await act(async()=>root.render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Finanzas /></MemoryRouter>));
 await act(async()=>old.resolve(JSON.stringify(empty)));expect(div.textContent).not.toContain('Vista previa local');
});
it('blocks confirmation synchronously while replacement parsing is pending',async()=>{
 await mount();await choose(Promise.resolve(JSON.stringify(empty)));const pending=deferred<string>();
 const input=div.querySelector('input')!;const confirm=[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Confirmar'))!;
 Object.defineProperty(input,'files',{configurable:true,value:[{size:100,text:()=>pending.promise}]});
 await act(async()=>{input.dispatchEvent(new Event('change',{bubbles:true}));confirm.click();});
 expect(repo.save).not.toHaveBeenCalled();await act(async()=>pending.resolve(JSON.stringify(empty)));
});
it('shows honest empty state and local import without invented balances', async () => { await mount(); expect(div.textContent).toContain('Sin instantánea privada'); expect(div.textContent).toContain('Importar JSON'); expect(div.textContent).toContain('No son datos en vivo'); });
it('denies other authenticated users', async () => { state.user = { id: 'other', email: 'other@example.com' }; await mount(); expect(div.textContent).toContain('Acceso restringido'); expect(div.querySelector('input')).toBeNull(); });
it('shows recoverable connection error', async () => { repo.load.mockRejectedValueOnce(new Error('offline')); await mount(); expect(div.textContent).toContain('offline'); expect(div.textContent).toContain('Volver a consultar'); });
it('protected finance route never renders content for anonymous users', async () => { state.user = null; await mount(<ProtectedRoute><Finanzas /></ProtectedRoute>); expect(div.textContent).not.toContain('Importar JSON'); });
it('validates a local file, previews, then persists only on explicit confirmation', async () => {
    await mount();
    const snapshot = { version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: {}, sources: [], accounts: [] };
    const input = div.querySelector('input')!;
    Object.defineProperty(input, 'files', { configurable: true, value: [{ size: 200, text: async () => JSON.stringify(snapshot) }] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(div.textContent).toContain('Vista previa local');
    expect(repo.save).not.toHaveBeenCalled();
    repo.save.mockResolvedValueOnce({ snapshot, importedAt: snapshot.asOf });
    const confirm = [...div.querySelectorAll('button')].find(b => b.textContent?.includes('Confirmar'))!;
    await act(async () => confirm.click());
    expect(repo.save).toHaveBeenCalledWith(snapshot);
    expect(div.textContent).toContain('guardada y verificada');
});
it('rejects invalid local JSON without allowing confirmation', async () => {
    await mount();
    const input = div.querySelector('input')!;
    Object.defineProperty(input, 'files', { value: [{ size: 20, text: async () => '{"user_id":"other"}' }] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(div.textContent).toContain('JSON inválido');
    expect(div.textContent).not.toContain('Confirmar y reemplazar');
});
it('clears private rendered state on identity change', async () => {
    repo.load.mockResolvedValueOnce({ snapshot: { version: 1, asOf: '2026-11-20T12:00:00Z', baseCurrency: 'USD', fx: {}, sources: [], accounts: [] }, importedAt: '2026-11-20T12:00:00Z' });
    await mount();
    expect(div.textContent).toContain('Datos al');
    state.user = { id: 'other', email: 'other@example.com' };
    await act(async () => root.render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Finanzas /></MemoryRouter>));
    expect(div.textContent).not.toContain('Datos al');
});

it('shows no donut slices for an all-debt snapshot and keeps the signed total',async()=>{
 repo.load.mockResolvedValueOnce({snapshot:{...empty,sources:[{id:'s',label:'Synthetic',asOf:empty.asOf,status:'ok'}],accounts:[{id:'a',label:'Synthetic',balanceScope:'a',ownership:'joint',sourceId:'s',holdings:[],cash:[{currency:'USD',amount:-50}]}]},importedAt:empty.asOf});
 await mount();
 expect(div.querySelectorAll('.recharts-pie-sector')).toHaveLength(0);
 expect(div.textContent?.match(/Sin valores positivos incluidos para graficar/g)).toHaveLength(2);
 expect(div.querySelector('tbody tr')?.textContent).toContain('-US$');
 expect(div.textContent).toContain('Deuda / posiciones negativas incluidas');
});
it('renders one economic-asset table by default with signed cash and partial totals',async()=>{
 const source={id:'broker',label:'Fuente de prueba',asOf:'2020-01-01T00:00:00Z',status:'ok'};
 const account={id:'synthetic',label:'Cuenta de prueba',ownership:'laura',sourceId:'broker',balanceScope:'one',holdings:[{symbol:'TEST',name:'Activo de prueba',assetClass:'Acciones',currency:'EUR',quantity:1,marketValue:10,costBasis:null}],cash:[{currency:'USD',amount:-2}]};
 repo.load.mockResolvedValueOnce({snapshot:{version:1,asOf:source.asOf,baseCurrency:'USD',fx:{},sources:[source],accounts:[account,{...account,id:'joint-test',balanceScope:'two',ownership:'joint'}]},importedAt:source.asOf});
 await mount();expect(div.textContent).toContain('Consolidado · todas las cuentas');
 expect(div.querySelectorAll('table')).toHaveLength(1);
 expect(div.querySelectorAll('tbody tr')).toHaveLength(2);
 expect(div.querySelector('thead')?.textContent).not.toContain('Cuenta');
 expect(div.textContent).toContain('Total parcial');expect(div.textContent).toContain('Costo no disponible');expect(div.textContent).toContain('desactualizada');
 expect(div.textContent).toContain('Distribución por activo');expect(div.textContent).toContain('Distribución por clase');
 expect(div.textContent).toContain('No es rentabilidad histórica');
});
