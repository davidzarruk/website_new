import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { kanbanSupabase, KANBAN_COLUMNS, type Ticket } from '@/integrations/kanban/client';
import KanbanColumn from './KanbanColumn';
import { toast } from 'sonner';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    const { data, error } = await kanbanSupabase
      .from('tickets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tickets');
      console.error(error);
    } else {
      setTickets((data as Ticket[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();

    const channel = kanbanSupabase
      .channel('tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      kanbanSupabase.removeChannel(channel);
    };
  }, [fetchTickets]);

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    const ticket = tickets.find((t) => t.id === draggableId);
    if (!ticket || ticket.status === newStatus) return;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? { ...t, status: newStatus, updated_at: new Date().toISOString(), completed_at: newStatus === 'done' ? new Date().toISOString() : t.completed_at }
          : t
      )
    );

    const updatePayload: Record<string, string> = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'done') updatePayload.completed_at = new Date().toISOString();

    const { error } = await kanbanSupabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', draggableId);

    if (error) {
      toast.error('Failed to update ticket');
      fetchTickets(); // revert
    }
  };

  const grouped = KANBAN_COLUMNS.map((col) => ({
    ...col,
    tickets: tickets.filter((t) => t.status === col.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading board…</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map((col) => (
          <KanbanColumn key={col.id} columnId={col.id} label={col.label} tickets={col.tickets} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
