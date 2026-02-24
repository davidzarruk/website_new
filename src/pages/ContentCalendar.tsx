import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentCalendarClient, type ContentItem } from '@/integrations/content-calendar/client';
import CalendarGrid from '@/components/content-calendar/CalendarGrid';
import CalendarSummary from '@/components/content-calendar/CalendarSummary';
import ContentCardModal from '@/components/content-calendar/ContentCardModal';
import MobileListView from '@/components/content-calendar/MobileListView';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const ContentCalendar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contentCalendarClient
      .from('content_calendar')
      .select('*')
      .order('scheduled_date', { ascending: true });
    if (error) {
      toast.error('Failed to load content');
      console.error(error);
    } else {
      setItems((data as ContentItem[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };
  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const openEdit = (item: ContentItem) => { setEditItem(item); setDefaultDate(''); setModalOpen(true); };
  const openCreate = (dateStr: string) => { setEditItem(null); setDefaultDate(dateStr); setModalOpen(true); };

  const handleSave = async (data: Partial<ContentItem>) => {
    const { id, ...rest } = data;
    if (id) {
      const { error } = await contentCalendarClient.from('content_calendar').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) { toast.error('Update failed'); return; }
    } else {
      const { error } = await contentCalendarClient.from('content_calendar').insert(rest as any);
      if (error) { toast.error('Create failed'); return; }
    }
    toast.success(id ? 'Updated' : 'Created');
    setModalOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const { error } = await contentCalendarClient.from('content_calendar').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success('Deleted');
    setModalOpen(false);
    fetchItems();
  };

  const handleReschedule = async (id: string, newDate: string) => {
    const { error } = await contentCalendarClient.from('content_calendar').update({ scheduled_date: newDate, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('Reschedule failed'); return; }
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/private')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
            <h1 className="font-heading text-2xl text-foreground">Content Calendar</h1>
          </div>
        </div>

        <CalendarSummary items={items} />

        {/* Month nav */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prev} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="font-heading text-lg text-foreground min-w-[160px] text-center">
              {format(new Date(year, month), 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={next} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : isMobile ? (
          <MobileListView year={year} month={month} items={items} onCardClick={openEdit} onEmptyDayClick={openCreate} />
        ) : (
          <CalendarGrid year={year} month={month} items={items} onCardClick={openEdit} onEmptyDayClick={openCreate} onReschedule={handleReschedule} />
        )}
      </div>

      <ContentCardModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editItem}
        defaultDate={defaultDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ContentCalendar;
