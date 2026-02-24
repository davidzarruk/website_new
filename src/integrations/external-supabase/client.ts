import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxhpvtwxpgpflgqylgsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHB2dHd4cGdwZmxncXlsZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDcwODMsImV4cCI6MjA4Njc4MzA4M30.j8o2GMh3xI5s6Cbvb4A-3BCvzxr6UnM499VhF4KJsTE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'external-auth-token',
  },
});
