// Static contract only: does not execute SQL or prove deployed RLS.
import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
it('fails closed for missing/null or string versions in the SQL envelope', () => {
 const sql=readFileSync('supabase/migrations/20261120220000_private_finance.sql','utf8');
 expect(sql).toMatch(/jsonb_typeof\(snapshot->'version'\)\s*=\s*'number'/);
 expect(sql).toMatch(/check\s*\(\s*coalesce\(/i);
 expect(sql).toMatch(/,\s*false\)\)/);
});
