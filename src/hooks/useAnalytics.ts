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

export interface UserListItem {
  id: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  points: number;
  age: number | null;
  country_code: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  photo_count?: number;
  race_count?: number;
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
  const [userList, setUserList] = useState<UserListItem[]>([]);
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
      usersRes,
    ] = await Promise.all([
      supabase.from('analytics_summary').select('*').single(),
      supabase.from('analytics_daily_signups').select('*').order('day', { ascending: true }),
      supabase.from('analytics_daily_photos').select('*').order('day', { ascending: true }),
      supabase.from('analytics_page_views').select('*'),
      supabase.from('analytics_sessions').select('*'),
      supabase.from('analytics_funnel').select('*').single(),
      supabase.from('analytics_hourly_activity').select('*'),
      supabase.from('analytics_effects').select('*'),
      supabase.from('analytics_top_races').select('*'),
      supabase.from('user_profiles').select('id, full_name, username, created_at, points, age, country_code, bio, instagram, tiktok').order('created_at', { ascending: false }),
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
    
    if (usersRes.data) {
      const users = usersRes.data as unknown as UserListItem[];
      
      // Fetch photo and race counts for each user
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const [photoRes, raceRes] = await Promise.all([
            supabase.from('user_photos').select('*', { count: 'exact' }).eq('user_id', user.id),
            supabase.from('user_race_history').select('*', { count: 'exact' }).eq('user_id', user.id),
          ]);
          
          return {
            ...user,
            photo_count: photoRes.count ?? 0,
            race_count: raceRes.count ?? 0,
          };
        })
      );
      
      setUserList(enrichedUsers);
    }

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
    userList,
    loading,
    isLive,
    setIsLive,
    refresh: fetchAll,
  };
}
