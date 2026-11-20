import type { SupabaseClient } from '@supabase/supabase-js';
import { snapshotSchema, type Snapshot } from './finance';
export const isFinanceOwner = (user: {
    email?: string;
} | null) => user?.email?.toLowerCase() === 'davidzarruk@gmail.com';
export function createFinanceRepository(client: SupabaseClient) {
    async function identity() {
        const { data, error } = await client.auth.getUser();
        if (error || !data.user || !isFinanceOwner(data.user))
            throw new Error('Acceso no autorizado');
        return data.user.id;
    }
    async function checkIdentity(id: string) {
        if (await identity() !== id) throw new Error('La sesión cambió; vuelve a consultar.');
    }
    async function read(id: string) {
        await checkIdentity(id);
        const { data, error } = await client.from('finance_snapshots').select('snapshot, imported_at').eq('user_id', id).maybeSingle();
        if (error?.code === 'PGRST205' || error?.code === '42P01')
            throw new Error('El almacenamiento privado de Finanzas aún no está configurado. Falta activar la base de datos; no es un problema de tu sesión.');
        if (error) throw new Error('No se pudo leer la instantánea privada. Verifica la conexión y la configuración de acceso.');
        const result = data ? { snapshot: snapshotSchema.parse(data.snapshot), importedAt: data.imported_at } : null;
        await checkIdentity(id);
        return result;
    }
    return {
        async load(): Promise<{
            snapshot: Snapshot;
            importedAt: string;
        } | null> {
            const id = await identity();
            return read(id);
        },
        async save(input: unknown) {
            const snapshot = snapshotSchema.parse(input);
            const id = await identity();
            const { error } = await client.from('finance_snapshots').upsert({ user_id: id, snapshot }, { onConflict: 'user_id' });
            if (error)
                throw new Error('No se pudo guardar. Verifica la conexión y las políticas de acceso.');
            const verified = await read(id);
            if (!verified || JSON.stringify({ ...verified.snapshot, fx: Object.entries(verified.snapshot.fx).sort() }) !== JSON.stringify({ ...snapshot, fx: Object.entries(snapshot.fx).sort() }))
                throw new Error('No se pudo verificar la importación; vuelve a consultar.');
            await checkIdentity(id);
            return verified;
        }
    };
}
