import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import type { Ticket } from '@/integrations/kanban/client';

interface KanbanColumnProps {
  columnId: string;
  label: string;
  tickets: Ticket[];
}

const KanbanColumn = ({ columnId, label, tickets }: KanbanColumnProps) => {
  const isDone = columnId === 'done';

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tickets.length}
        </span>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/10 border-accent/30' : 'bg-muted/30 border-transparent'
            } border-2 border-dashed`}
          >
            {tickets.map((ticket, index) => (
              <KanbanCard key={ticket.id} ticket={ticket} index={index} isDoneColumn={isDone} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
