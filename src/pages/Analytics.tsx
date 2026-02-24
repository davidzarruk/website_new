import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const ACCENT_COLORS = [
  'hsl(24, 70%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(220, 60%, 55%)',
  'hsl(340, 60%, 55%)', 'hsl(280, 50%, 55%)', 'hsl(45, 80%, 50%)',
  'hsl(190, 60%, 45%)', 'hsl(0, 65%, 55%)',
];

const MetricCard = ({ title, value, loading }: { title: string; value: string | number; loading: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? <Skeleton className="h-8 w-24" /> : (
        <p className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      )}
    </CardContent>
  </Card>
);

const ToggleMetricCard = ({ title, values, loading }: { title: string; values: Record<string, number | undefined>; loading: boolean }) => {
  const periods = Object.keys(values);
  const [active, setActive] = useState(periods[0]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : (
          <p className="text-2xl font-bold text-foreground">{(values[active] ?? 0).toLocaleString()}</p>
        )}
        <div className="flex gap-1 mt-2">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${active === p ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HeatmapGrid = ({ data }: { data: { day_of_week: number; hour: number; count: number }[] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const grid: Record<string, number> = {};
  data.forEach(d => { grid[`${d.day_of_week}-${d.hour}`] = d.count; });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-0.5">
          <div className="w-10" />
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center">{i}</div>
          ))}
        </div>
        {days.map((day, di) => (
          <div key={day} className="flex gap-0.5 mt-0.5">
            <div className="w-10 text-[10px] text-muted-foreground flex items-center">{day}</div>
            {Array.from({ length: 24 }, (_, h) => {
              const count = grid[`${di + 1}-${h}`] || 0;
              const intensity = count / maxCount;
              return (
                <div
                  key={h}
                  className="flex-1 aspect-square rounded-sm"
                  style={{ backgroundColor: `hsl(24, 70%, 50%, ${0.08 + intensity * 0.9})` }}
                  title={`${day} ${h}:00 — ${count}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const FunnelViz = ({ data }: { data: { upload?: number; editor?: number; export?: number; saved?: number } }) => {
  const steps = [
    { label: 'Upload', value: Number(data?.upload ?? 0) },
    { label: 'Editor', value: Number(data?.editor ?? 0) },
    { label: 'Export', value: Number(data?.export ?? 0) },
    { label: 'Saved', value: Number(data?.saved ?? 0) },
  ];
  const max = Math.max(...steps.map(s => s.value), 1);
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span className="w-14 text-xs text-muted-foreground text-right">{step.label}</span>
          <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${(step.value / max) * 100}%`,
                backgroundColor: ACCENT_COLORS[i],
              }}
            />
          </div>
          <span className="text-sm font-medium text-foreground w-16">{step.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const {
    summary, dailySignups, dailyPhotos, pageViews, sessions,
    funnel, hourlyActivity, effects, topRaces, loading, isLive,
  } = useAnalytics();

  const avgSessionMin = sessions.length > 0
    ? (sessions.reduce((a, s) => a + s.duration_seconds, 0) / sessions.length / 60).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-foreground">DataRunner Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time metrics dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {isLive && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(160, 60%, 45%)' }} />
                Live
              </div>
            )}
            <Link to="/private" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </Link>
          </div>
        </div>

        {/* Row 1: Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Total Users" value={summary?.total_users ?? 0} loading={loading} />
          <ToggleMetricCard
            title="Active Users"
            values={{ '24h': summary?.active_users_24h, '7d': summary?.active_users_7d, '30d': summary?.active_users_30d }}
            loading={loading}
          />
          <MetricCard title="Total Photos" value={summary?.total_photos ?? 0} loading={loading} />
          <ToggleMetricCard
            title="Photos Created"
            values={{ '24h': summary?.photos_24h, '7d': summary?.photos_7d, '30d': summary?.photos_30d }}
            loading={loading}
          />
        </div>

        {/* Row 2: Line Charts */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Daily Signups</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySignups}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip />
                    <Line type="monotone" dataKey="signups" stroke="hsl(24, 70%, 50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Daily Photos</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyPhotos}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip />
                    <Line type="monotone" dataKey="photos" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Engagement */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Avg Session Duration</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-16 w-24" /> : (
                <div>
                  <p className="text-4xl font-bold text-foreground">{avgSessionMin}</p>
                  <p className="text-sm text-muted-foreground">minutes</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Page Views by Screen</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageViews} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="page" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="total_views" fill="hsl(24, 70%, 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              {loading || !funnel ? <Skeleton className="h-40 w-full" /> : <FunnelViz data={funnel} />}
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Details */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle className="text-base">Hourly Activity</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48 w-full" /> : <HeatmapGrid data={hourlyActivity} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Popular Effects</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={effects} dataKey="count" nameKey="effect" cx="50%" cy="50%" outerRadius={80} label={({ effect }) => effect}>
                      {effects.map((_, i) => (
                        <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Top Races</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-40 w-full" /> : (
                <div className="space-y-2">
                  {topRaces.map((race, i) => (
                    <div key={race.race} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <span className="text-sm text-foreground">{race.race}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{race.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 5: Profile Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard title="With Username" value={summary?.users_with_username ?? 0} loading={loading} />
          <MetricCard title="With Bio" value={summary?.users_with_bio ?? 0} loading={loading} />
          <MetricCard title="Public Profiles" value={summary?.public_profiles ?? 0} loading={loading} />
          <MetricCard title="Instagram" value={summary?.instagram_contributions ?? 0} loading={loading} />
          <MetricCard title="Total Points" value={summary?.total_points ?? 0} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
