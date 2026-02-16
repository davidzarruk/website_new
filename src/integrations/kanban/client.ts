import { createClient } from '@supabase/supabase-js';

const KANBAN_SUPABASE_URL = 'https://cxhpvtwxpgpflgqylgsi.supabase.co';
const KANBAN_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHB2dHd4cGdwZmxncXlsZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDcwODMsImV4cCI6MjA4Njc4MzA4M30.j8o2GMh3xI5s6Cbvb4A-3BCvzxr6UnM499VhF4KJsTE';

export const kanbanSupabase = createClient(KANBAN_SUPABASE_URL, KANBAN_SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'kanban-auth-token',
  },
});

export interface Ticket {
  id: string;
  title: string;
  status: string;
  role: string | null;
  assignee: string | null;
  priority: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  owner_id: string;
}

export const KANBAN_COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'next', label: 'Next' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'qa', label: 'QA' },
  { id: 'done', label: 'Done' },
] as const;
