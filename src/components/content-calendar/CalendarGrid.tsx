import { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { ContentItem } from '@/integrations/content-calendar/client';

const PILLAR_DOT: Record<string, string> = {
  hot_take: 'bg-red-500',
  el_dato: 'bg-blue-500',
  sabias_que: 'bg-purple-500',
  detras_del_dato: 'bg-emerald-500',
  en_la_calle: 'bg-orange-500',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  year: number;
  month: number;
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
  onEmptyDayClick: (dateStr: string) => void;
  onReschedule: (id: string, newDate: string) => void;
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function progressDots(item: ContentItem) {
  const steps = [item.has_idea, item.has_script, item.has_recording, item.has_edit, item.is_ready];
  return (
    <div className="flex gap-0.5 mt-0.5">
      {steps.map((s, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${s ? 'bg-accent' : 'bg-border'}`} />
      ))}
    </div>
  );
}

const CalendarGrid = ({ year, month, items, onCardClick, onEmptyDayClick, onReschedule }: CalendarGridProps) => {
  const cells = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    items.forEach((item) => {
      if (item.scheduled_date) {
        const key = item.scheduled_date;
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    });
    return map;
  }, [items]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const id = result.draggableId;
    const destDate = result.destination.droppableId;
    if (destDate && destDate !== 'null') {
      onReschedule(id, destDate);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-xs text-muted-foreground text-center py-2 border-b border-r border-border bg-secondary/50 font-medium">{d}</div>
        ))}
        {cells.map((day, idx) => {
          const key = day ? dateStr(day) : `empty-${idx}`;
          const dayItems = day ? (itemsByDate[dateStr(day)] || []) : [];
          return (
            <Droppable droppableId={day ? dateStr(day) : `null-${idx}`} key={key} isDropDisabled={!day}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[90px] md:min-h-[110px] border-b border-r border-border p-1 transition-colors
                    ${!day ? 'bg-muted/30' : snapshot.isDraggingOver ? 'bg-accent/10' : 'bg-card'}
                    ${day ? 'cursor-pointer' : ''}`}
                  onClick={() => day && dayItems.length === 0 && onEmptyDayClick(dateStr(day))}
                >
                  {day && (
                    <span className={`text-xs font-medium block mb-1 ${isToday(day) ? 'text-accent' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                  )}
                  {dayItems.map((item, i) => (
                    <Draggable key={item.id} draggableId={item.id} index={i}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={(e) => { e.stopPropagation(); onCardClick(item); }}
                          className="group mb-1 rounded-md bg-background border border-border hover:border-accent/40 p-1.5 cursor-pointer transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${PILLAR_DOT[item.pillar] || 'bg-muted-foreground'}`} />
                            <span className="text-[11px] text-foreground truncate leading-tight">{item.title}</span>
                          </div>
                          {progressDots(item)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default CalendarGrid;
