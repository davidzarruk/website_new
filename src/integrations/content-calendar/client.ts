import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://agegeoxsyebswcpncqcg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZWdlb3hzeWVic3djcG5jcWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzgzNjcsImV4cCI6MjA4NjkxNDM2N30._jBm48fpo8kFVR6UZPvi43FXycMhfqfUz3Lf-XvBLAQ';

export interface ContentItem {
  id: string;
  week: number | null;
  day_of_week: string | null;
  pillar: string;
  title: string;
  description: string | null;
  scheduled_date: string | null;
  has_idea: boolean;
  has_script: boolean;
  has_recording: boolean;
  has_edit: boolean;
  is_ready: boolean;
  notes: string | null;
  instagram_caption: string | null;
  tiktok_caption: string | null;
  effort: string | null;
  created_at: string;
  updated_at: string;
}

export const contentCalendarClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
