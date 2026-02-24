import { supabase } from '@/integrations/external-supabase/client';

export const kanbanSupabase = supabase;

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
