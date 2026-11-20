import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/external-supabase/client';
import { createFinanceRepository, isFinanceOwner } from '@/lib/financeRepository';
import { snapshotSchema, type Snapshot } from '@/lib/finance';
import SnapshotView from '@/components/FinanceOverview';
import { Wallet, ShieldCheck, Upload, RefreshCw } from 'lucide-react';
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
    const [preview, setPreview] = useState<Snapshot | null>(null);
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
 {record && <><div className="flex flex-wrap justify-between gap-4"><div><p>Datos al {new Date(record.snapshot.asOf).toLocaleString('es-CO')}</p><p className="text-xs text-muted-foreground">Importada el {new Date(record.importedAt).toLocaleString('es-CO')}</p></div></div><SnapshotView snapshot={record.snapshot}/></>}
 <section className={panel}><h2 className="flex items-center gap-2 font-heading text-xl"><Upload size={20}/>Importar JSON</h2><p className="my-3 text-sm text-muted-foreground">Validación local y vista previa antes de reemplazar tu instantánea privada. Sin credenciales ni trading. Máximo 2 MB.</p><input aria-label="Archivo JSON privado" type="file" accept="application/json,.json" disabled={busy} onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }} className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2"/>{preview && <div className="mt-6 space-y-4"><h3>Vista previa local · aún no guardada</h3><SnapshotView snapshot={preview}/><button className={button} disabled={busy || reading} onClick={save}>Confirmar y reemplazar mi instantánea</button><button className={button} disabled={busy} onClick={() => { ++reads.current; setReading(false); setPreview(null); }}>Descartar</button></div>}</section></div>;
}
