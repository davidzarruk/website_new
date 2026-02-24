import type { ContentItem } from '@/integrations/content-calendar/client';
import { Progress } from '@/components/ui/progress';

const PILLAR_COLORS: Record<string, string> = {
  hot_take: 'bg-red-500',
  el_dato: 'bg-blue-500',
  sabias_que: 'bg-purple-500',
  detras_del_dato: 'bg-emerald-500',
  en_la_calle: 'bg-orange-500',
};

const PILLAR_LABELS: Record<string, string> = {
  hot_take: 'Hot Take',
  el_dato: 'El Dato',
  sabias_que: 'Sabías Que',
  detras_del_dato: 'Detrás del Dato',
  en_la_calle: 'En la Calle',
};

interface CalendarSummaryProps {
  items: ContentItem[];
}

const CalendarSummary = ({ items }: CalendarSummaryProps) => {
  const total = items.length;
  const ready = items.filter((i) => i.is_ready).length;
  const pct = total ? Math.round((ready / total) * 100) : 0;

  const byPillar = Object.keys(PILLAR_COLORS).map((p) => {
    const pillarItems = items.filter((i) => i.pillar === p);
    const pillarReady = pillarItems.filter((i) => i.is_ready).length;
    return { key: p, total: pillarItems.length, ready: pillarReady };
  });

  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const upcoming = items.filter((i) => {
    if (!i.scheduled_date) return false;
    const d = new Date(i.scheduled_date + 'T00:00:00');
    return d >= today && d <= endOfWeek && !i.is_ready;
  });

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[#222] border border-[#333]">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-400">Overall progress</span>
          <span className="text-neutral-300 font-medium">{ready}/{total} ready ({pct}%)</span>
        </div>
        <Progress value={pct} className="h-2 bg-[#333]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {byPillar.map((p) => (
          <div key={p.key} className="flex items-center gap-2 text-xs text-neutral-400">
            <span className={`w-2 h-2 rounded-full ${PILLAR_COLORS[p.key]}`} />
            <span>{PILLAR_LABELS[p.key]}</span>
            <span className="text-neutral-500">{p.ready}/{p.total}</span>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="border-t border-[#333] pt-3">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">This week</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {upcoming.slice(0, 5).map((u) => (
              <span key={u.id} className="text-xs bg-[#2a2a2a] border border-[#333] rounded px-2 py-0.5 text-neutral-300 truncate max-w-[140px]">
                {u.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSummary;
