import { useState, useEffect, useCallback } from 'react';
import { contentCalendarClient } from '@/integrations/content-calendar/client';

export interface AnalyticsSummary {
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;
  total_photos: number;
  photos_24h: number;
  photos_7d: number;
  photos_30d: number;
  users_with_username: number;
  users_with_bio: number;
  public_profiles: number;
  instagram_contributions: number;
  total_points: number;
}

export interface DailySignup {
  day: string;
  signups: number;
}

export interface DailyPhoto {
  day: string;
  photos: number;
}

export interface PageView {
  page: string;
  total_views: number;
  unique_users: number;
}

export interface SessionData {
  duration_seconds: number;
}

export interface FunnelData {
  upload: number;
  editor: number;
  export: number;
  saved: number;
}

export interface HourlyActivity {
  day_of_week: number;
  hour: number;
  count: number;
}

export interface EffectUsage {
  effect: string;
  count: number;
}

export interface TopRace {
  race: string;
  count: number;
}

const supabase = contentCalendarClient;

export function useAnalytics(refreshInterval = 60000) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailySignups, setDailySignups] = useState<DailySignup[]>([]);
  const [dailyPhotos, setDailyPhotos] = useState<DailyPhoto[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [effects, setEffects] = useState<EffectUsage[]>([]);
  const [topRaces, setTopRaces] = useState<TopRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  const fetchAll = useCallback(async () => {
    const [
      summaryRes,
      signupsRes,
      photosRes,
      pageViewsRes,
      sessionsRes,
      funnelRes,
      hourlyRes,
      effectsRes,
      racesRes,
    ] = await Promise.all([
      supabase.from('analytics_summary').select('*').single(),
      supabase.from('analytics_daily_signups').select('*'),
      supabase.from('analytics_daily_photos').select('*'),
      supabase.from('analytics_page_views').select('*'),
      supabase.from('analytics_sessions').select('*'),
      supabase.from('analytics_funnel').select('*').single(),
      supabase.from('analytics_hourly_activity').select('*'),
      supabase.from('analytics_effects').select('*'),
      supabase.from('analytics_top_races').select('*'),
    ]);

    if (summaryRes.data) setSummary(summaryRes.data as unknown as AnalyticsSummary);
    if (signupsRes.data) setDailySignups(signupsRes.data as unknown as DailySignup[]);
    if (photosRes.data) setDailyPhotos(photosRes.data as unknown as DailyPhoto[]);
    if (pageViewsRes.data) setPageViews(pageViewsRes.data as unknown as PageView[]);
    if (sessionsRes.data) setSessions(sessionsRes.data as unknown as SessionData[]);
    if (funnelRes.data) setFunnel(funnelRes.data as unknown as FunnelData);
    if (hourlyRes.data) setHourlyActivity(hourlyRes.data as unknown as HourlyActivity[]);
    if (effectsRes.data) setEffects(effectsRes.data as unknown as EffectUsage[]);
    if (racesRes.data) setTopRaces(racesRes.data as unknown as TopRace[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchAll();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAll, refreshInterval]);

  return {
    summary,
    dailySignups,
    dailyPhotos,
    pageViews,
    sessions,
    funnel,
    hourlyActivity,
    effects,
    topRaces,
    loading,
    isLive,
    setIsLive,
    refresh: fetchAll,
  };
}
