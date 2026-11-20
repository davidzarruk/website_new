import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/external-supabase/client';
import { createFinanceRepository, isFinanceOwner } from '@/lib/financeRepository';
import { snapshotSchema, summarize, type Snapshot } from '@/lib/finance';
import { Wallet, ShieldCheck, Upload, RefreshCw } from 'lucide-react';
const owners = { laura: 'Laura individual', joint: 'Laura y David conjunta', david: 'David individual' };
const panel = 'rounded-2xl border border-border bg-card p-5 sm:p-7';
const button = 'inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50';
export default function Finanzas() {
    const { user, loading, signOut } = useAuth();
    return <main className="min-h-screen bg-background px-4 py-10 [overflow-wrap:anywhere] sm:px-8"><div className="mx-auto max-w-6xl"><header className="mb-10 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[.25em] text-muted-foreground">Área privada · Patrimonio familiar</p><h1 className="mt-2 font-heading text-4xl">Finanzas</h1></div><nav className="flex gap-4 text-sm"><Link to="/private">← Área privada</Link><button onClick={signOut}>Cerrar sesión</button></nav></header>{loading ? <p role="status">Verificando acceso…</p> : isFinanceOwner(user) && user ? <Workspace key={user.id}/> : <section className={panel}><ShieldCheck /><h2>Acceso restringido</h2><p>Disponible únicamente para el titular autorizado.</p></section>}</div></main>;
}
function Workspace() {
    const repository = useMemo(() => createFinanceRepository(supabase), []);
    const [record, setRecord] = useState<Awaited<ReturnType<typeof repository.load>>>(null);
    const [busy, setBusy] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [preview, setPreview] = useState<Snapshot | null>(null), [consolidated, setConsolidated] = useState(false);
    const alive = useRef(true), generation = useRef(0), reads = useRef(0), operation = useRef(false);
    const [reading, setReading] = useState(false);
    useEffect(() => { const readToken = reads, operationToken = generation; alive.current = true; return () => { alive.current = false; operation.current = false; ++readToken.current; ++operationToken.current; }; }, []);
    const load = useCallback(async () => { if (operation.current) return; operation.current = true; const n = ++generation.current; setBusy(true); setError(''); setRecord(null); try {
        const data = await repository.load();
        if (alive.current && n === generation.current)
            setRecord(data);
    }
    catch (e) {
        if (alive.current && n === generation.current)
            setError(e instanceof Error ? e.message : 'Error de conexión');
    }
    finally {
        if (alive.current && n === generation.current)
            { operation.current = false; setBusy(false); }
    } }, [repository]);
    useEffect(() => { void load(); }, [load]);
    async function read(file?: File) { if (operation.current) return; const n = ++reads.current; setReading(!!file); setPreview(null); setNotice(''); setError(''); if (!file)
        return; try {
        if (file.size > 2000000)
            throw new Error('El archivo supera 2 MB.');
        const text = await file.text();
        if (!alive.current || n !== reads.current) return;
        const parsed = snapshotSchema.safeParse(JSON.parse(text));
        if (!parsed.success)
            throw new Error('JSON inválido: ' + parsed.error.issues.slice(0, 4).map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
        if (alive.current && n === reads.current)
            setPreview(parsed.data);
    }
    catch (e) {
        if (alive.current && n === reads.current)
            setError(e instanceof Error ? e.message : 'Archivo inválido');
    } finally { if (alive.current && n === reads.current) setReading(false); } }
    async function save() { if (!preview || reading || operation.current)
        return; operation.current = true; const n = ++generation.current; ++reads.current; setReading(false); setBusy(true); setError(''); try {
        const saved = await repository.save(preview);
        if (alive.current && n === generation.current) {
            setRecord(saved);
            setPreview(null);
            setNotice('Importación guardada y verificada en tu cuenta.');
        }
    }
    catch (e) {
        if (alive.current && n === generation.current)
            setError(e instanceof Error ? e.message : 'Error de importación');
    }
    finally {
        if (alive.current && n === generation.current) { operation.current = false; setBusy(false); }
    } }
    return <div className="space-y-6"><section className={`${panel} flex flex-wrap items-center justify-between gap-4`}><div><h2 className="flex items-center gap-2 font-heading text-xl"><ShieldCheck size={20}/>Instantánea privada</h2><p className="mt-2 text-sm text-muted-foreground">No son datos en vivo. Consultar solo lee la instantánea guardada; no conecta con brokers.</p></div><button className={button} disabled={busy} onClick={load}><RefreshCw size={16}/>Volver a consultar</button></section>
 {busy && <p role="status">Cargando información privada…</p>}{error && <p role="alert" className="rounded-xl border border-destructive p-4 text-destructive">{error}</p>}{notice && <p role="status">{notice}</p>}
 {!busy && !record && !error && <section className={`${panel} py-12 text-center`}><Wallet className="mx-auto mb-4"/><h2 className="font-heading text-2xl">Sin instantánea privada</h2><p className="mt-2 text-muted-foreground">Importa un archivo revisado. No se muestran saldos de ejemplo.</p></section>}
 {record && <><div className="flex flex-wrap justify-between gap-4"><div><p>Datos al {new Date(record.snapshot.asOf).toLocaleString('es-CO')}</p><p className="text-xs text-muted-foreground">Importada el {new Date(record.importedAt).toLocaleString('es-CO')}</p></div><label className="flex w-full min-w-0 flex-col gap-2 sm:w-auto">Vista <select className="w-full min-w-0 max-w-full rounded-lg border bg-background p-2" value={consolidated ? 'all' : 'separate'} onChange={e => setConsolidated(e.target.value === 'all')}><option value="separate">Cuentas separadas</option><option value="all">Consolidado explícito · todas las cuentas</option></select></label></div><SnapshotView snapshot={record.snapshot} consolidated={consolidated}/></>}
 <section className={panel}><h2 className="flex items-center gap-2 font-heading text-xl"><Upload size={20}/>Importar JSON</h2><p className="my-3 text-sm text-muted-foreground">Validación local y vista previa antes de reemplazar tu instantánea privada. Sin credenciales ni trading. Máximo 2 MB.</p><input aria-label="Archivo JSON privado" type="file" accept="application/json,.json" disabled={busy} onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }} className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2"/>{preview && <div className="mt-6 space-y-4"><h3>Vista previa local · aún no guardada</h3><SnapshotView snapshot={preview}/><button className={button} disabled={busy || reading} onClick={save}>Confirmar y reemplazar mi instantánea</button><button className={button} disabled={busy} onClick={() => { ++reads.current; setReading(false); setPreview(null); }}>Descartar</button></div>}</section></div>;
}
function SnapshotView({ snapshot: s, consolidated = false }: {
    snapshot: Snapshot;
    consolidated?: boolean;
}) {
    const money = (n: number, c = s.baseCurrency) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n);
    const groups = consolidated ? [{ label: 'Consolidado · todas las cuentas', accounts: s.accounts }] : s.accounts.map(a => ({ label: `${owners[a.ownership]} · ${a.label}`, accounts: [a] }));
    return <div className="space-y-6">{!s.accounts.length && <p>Sin cuentas en esta instantánea.</p>}<div className="grid gap-3 sm:grid-cols-2">{s.sources.map(source => { const age = Date.now() - Date.parse(source.asOf); return <div key={source.id} className="rounded-xl border p-4 text-sm"><strong>{source.label}</strong><p>Fecha de fuente: {new Date(source.asOf).toLocaleString('es-CO')}</p><p>{source.status === 'ok' ? 'Disponible' : source.status === 'error' ? 'Error de fuente' : 'Fuente no disponible'} · {age < 0 ? 'Fecha futura: revisar' : age > 86400000 ? 'Más de 24 h: desactualizada' : 'Menos de 24 h; no es tiempo real'}</p>{source.message && <p>{source.message}</p>}</div>; })}</div>{groups.map(group => { const v = summarize(s, group.accounts); return <section key={group.label} className={panel}><h2 className="font-heading text-2xl">{group.label}</h2><div className="my-6 grid gap-4 sm:grid-cols-3">{[['Valor neto incluido', money(v.total)], ['Efectivo neto (incluye deuda)', money(v.cash)], ['PnL incluido · costo conocido', money(v.pnl)]].map(([label, value]) => <div className="rounded-xl bg-muted/50 p-4" key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl tabular-nums">{value}</p></div>)}</div><p className="text-xs text-muted-foreground">PnL no realizado incluido = valor de mercado − costo conocido; excluye fuentes no disponibles y FX faltante. No es rentabilidad histórica; no incluye resultados realizados ni flujos. {v.unknownCost > 0 && `${v.unknownCost} posiciones sin costo excluidas del PnL.`}</p>{v.excluded.length > 0 && <p role="alert" className="mt-3 text-destructive">Total parcial. Excluido por FX faltante o fuente no disponible: {v.excluded.join(', ')}.</p>}<h3 className="mb-3 mt-6 font-heading text-lg">Asignación neta · {s.baseCurrency}</h3><p className="mb-3 text-xs text-muted-foreground">Porcentaje del valor neto incluido; puede ser negativo o superar 100% con deuda o posiciones cortas.</p><div className="space-y-3">{Object.entries(v.allocation).map(([label, value]) => <div key={label}><div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-sm"><span className="min-w-0">{label}</span><span className="min-w-0">{money(value)} · {v.total > 0 ? `${(value / v.total * 100).toFixed(1)}%` : '% no aplicable'}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded bg-muted"><div className={value < 0 ? 'h-full bg-destructive' : 'h-full bg-accent'} style={{ width: `${v.total > 0 ? Math.min(100, Math.abs(value / v.total * 100)) : 0}%` }}/></div></div>)}</div><h3 className="mb-3 mt-6 font-heading text-lg">Posiciones y efectivo · moneda original</h3><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Cuenta / activo</th><th>Clase</th><th>Cantidad</th><th>Moneda</th><th>Valor</th><th>PnL no realizado</th></tr></thead><tbody>{group.accounts.flatMap(a => [...a.holdings.map(h => <tr key={`${a.id}-${h.symbol}`} className="border-b"><td className="p-2">{a.label} · {h.symbol}{s.sources.find(source => source.id === a.sourceId)?.status !== 'ok' && <div>Detalle excluido de totales y PnL: fuente no disponible</div>}<div className="text-xs text-muted-foreground">{h.name}</div></td><td>{h.assetClass}</td><td>{h.quantity}</td><td>{h.currency}</td><td>{money(h.marketValue, h.currency)}</td><td>{h.costBasis === null ? 'Costo no disponible' : money(h.marketValue - h.costBasis, h.currency)}</td></tr>), ...a.cash.map(c => <tr key={`${a.id}-cash-${c.currency}`} className="border-b"><td className="p-2">{a.label} · Efectivo{s.sources.find(source => source.id === a.sourceId)?.status !== 'ok' && <div>Detalle excluido de totales y PnL: fuente no disponible</div>}</td><td>Efectivo / deuda</td><td>—</td><td>{c.currency}</td><td className={c.amount < 0 ? 'text-destructive' : ''}>{money(c.amount, c.currency)}</td><td>—</td></tr>)])}</tbody></table></div></section>; })}</div>;
}
