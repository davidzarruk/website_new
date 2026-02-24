import { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Checkbox } from '@/components/ui/checkbox';
import type { ContentItem } from '@/integrations/content-calendar/client';

const PILLAR_DOT: Record<string, string> = {
  hot_take: 'bg-red-500',
  el_dato: 'bg-blue-500',
  sabias_que: 'bg-purple-500',
  detras_del_dato: 'bg-emerald-500',
  en_la_calle: 'bg-orange-500',
};

const STEPS: { key: keyof Pick<ContentItem, 'has_idea' | 'has_script' | 'has_recording' | 'has_edit' | 'is_ready'>; label: string }[] = [
  { key: 'has_idea', label: '💡' },
  { key: 'has_script', label: '📝' },
  { key: 'has_recording', label: '🎙️' },
  { key: 'has_edit', label: '✂️' },
  { key: 'is_ready', label: '✅' },
];

const STEP_ORDER: (keyof Pick<ContentItem, 'has_idea' | 'has_script' | 'has_recording' | 'has_edit' | 'is_ready'>)[] = ['has_idea', 'has_script', 'has_recording', 'has_edit', 'is_ready'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  year: number;
  month: number;
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
  onEmptyDayClick: (dateStr: string) => void;
  onReschedule: (id: string, newDate: string) => void;
  onUpdateStep?: (id: string, updates: Partial<ContentItem>) => void;
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

const CalendarGrid = ({ year, month, items, onCardClick, onEmptyDayClick, onReschedule, onUpdateStep }: CalendarGridProps) => {
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

  const handleStepToggle = (item: ContentItem, stepKey: typeof STEP_ORDER[number], checked: boolean) => {
    if (!onUpdateStep) return;
    const idx = STEP_ORDER.indexOf(stepKey);
    const updates: Partial<ContentItem> = {};
    if (checked) {
      for (let i = 0; i <= idx; i++) updates[STEP_ORDER[i]] = true;
    } else {
      for (let i = idx; i < STEP_ORDER.length; i++) updates[STEP_ORDER[i]] = false;
    }
    onUpdateStep(item.id, updates);
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
                  className={`min-h-[150px] border-b border-r border-border p-1.5 transition-colors
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
                          className="group mb-1 rounded-md bg-background border border-border hover:border-accent/40 p-2 cursor-pointer transition-all hover:shadow-sm flex-1"
                        >
                          <div className="flex items-start gap-1.5 mb-1.5">
                            {item.image_url && (
                              <img src={item.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0 mt-0.5" />
                            )}
                            <div className="flex items-start gap-1.5 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${PILLAR_DOT[item.pillar] || 'bg-muted-foreground'}`} />
                              <span className="text-[11px] text-foreground leading-tight break-words">{item.title}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {STEPS.map((s) => (
                              <label
                                key={s.key}
                                className="flex items-center gap-0.5 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  className="h-3 w-3"
                                  checked={item[s.key]}
                                  onCheckedChange={(c) => handleStepToggle(item, s.key, !!c)}
                                />
                                <span className="text-[10px]">{s.label}</span>
                              </label>
                            ))}
                          </div>
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
