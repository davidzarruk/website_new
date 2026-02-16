import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/integrations/kanban/client';

interface KanbanCardProps {
  ticket: Ticket;
  index: number;
  isDoneColumn?: boolean;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const KanbanCard = ({ ticket, index, isDoneColumn }: KanbanCardProps) => {
  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border bg-card p-3 mb-2 transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-accent/40' : 'shadow-sm'
          } ${isDoneColumn ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-[11px] font-mono text-muted-foreground">{ticket.id}</span>
            {ticket.priority && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[ticket.priority.toLowerCase()] || ''}`}>
                {ticket.priority}
              </Badge>
            )}
          </div>
          <p className={`text-sm font-medium leading-snug ${isDoneColumn ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {ticket.title}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {ticket.role && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {ticket.role}
              </Badge>
            )}
            {ticket.assignee && (
              <span className="text-[11px] text-muted-foreground">
                → {ticket.assignee}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
