import type { ContentItem } from '@/integrations/content-calendar/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const PILLAR_DOT: Record<string, string> = {
  hot_take: 'bg-red-500',
  el_dato: 'bg-blue-500',
  sabias_que: 'bg-purple-500',
  detras_del_dato: 'bg-emerald-500',
  en_la_calle: 'bg-orange-500',
};

interface MobileListViewProps {
  year: number;
  month: number;
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
  onEmptyDayClick: (dateStr: string) => void;
}

const MobileListView = ({ year, month, items, onCardClick, onEmptyDayClick }: MobileListViewProps) => {
  const today = new Date();
  const refDate = new Date(year, month, Math.min(today.getDate(), new Date(year, month + 1, 0).getDate()));
  const weekStart = startOfWeek(refDate);
  const weekEnd = endOfWeek(refDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="flex flex-col gap-2">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayItems = items.filter((i) => i.scheduled_date === dateStr);
        const isToday = isSameDay(day, today);
        return (
          <div
            key={dateStr}
            className={`rounded-lg border p-3 ${isToday ? 'border-emerald-500/40 bg-[#222]' : 'border-[#333] bg-[#1a1a1a]'}`}
            onClick={() => dayItems.length === 0 && onEmptyDayClick(dateStr)}
          >
            <div className={`text-xs font-medium mb-1 ${isToday ? 'text-emerald-400' : 'text-neutral-500'}`}>
              {format(day, 'EEE, MMM d')}
            </div>
            {dayItems.length === 0 && <span className="text-xs text-neutral-600">No content</span>}
            {dayItems.map((item) => (
              <div
                key={item.id}
                onClick={(e) => { e.stopPropagation(); onCardClick(item); }}
                className="flex items-center gap-2 py-1 cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${PILLAR_DOT[item.pillar] || 'bg-neutral-500'}`} />
                <span className="text-sm text-neutral-300 truncate">{item.title}</span>
                <div className="flex gap-0.5 ml-auto">
                  {[item.has_idea, item.has_script, item.has_recording, item.has_edit, item.is_ready].map((s, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${s ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default MobileListView;
