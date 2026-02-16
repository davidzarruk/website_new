import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import type { Ticket } from '@/integrations/kanban/client';

interface KanbanColumnProps {
  columnId: string;
  label: string;
  tickets: Ticket[];
  onCardClick?: (ticket: Ticket) => void;
}

const columnStyles: Record<string, { dot: string; header: string; dropzone: string; dropzoneActive: string }> = {
  backlog: {
    dot: 'bg-slate-400',
    header: 'text-slate-600',
    dropzone: 'bg-slate-50/60 border-slate-200/50',
    dropzoneActive: 'bg-slate-100/80 border-slate-300',
  },
  next: {
    dot: 'bg-violet-400',
    header: 'text-violet-700',
    dropzone: 'bg-violet-50/40 border-violet-200/50',
    dropzoneActive: 'bg-violet-100/60 border-violet-300',
  },
  in_progress: {
    dot: 'bg-blue-400',
    header: 'text-blue-700',
    dropzone: 'bg-blue-50/40 border-blue-200/50',
    dropzoneActive: 'bg-blue-100/60 border-blue-300',
  },
  in_review: {
    dot: 'bg-amber-400',
    header: 'text-amber-700',
    dropzone: 'bg-amber-50/40 border-amber-200/50',
    dropzoneActive: 'bg-amber-100/60 border-amber-300',
  },
  qa: {
    dot: 'bg-orange-400',
    header: 'text-orange-700',
    dropzone: 'bg-orange-50/40 border-orange-200/50',
    dropzoneActive: 'bg-orange-100/60 border-orange-300',
  },
  done: {
    dot: 'bg-emerald-400',
    header: 'text-emerald-700',
    dropzone: 'bg-emerald-50/40 border-emerald-200/50',
    dropzoneActive: 'bg-emerald-100/60 border-emerald-300',
  },
};

const defaultStyle = columnStyles.backlog;

const KanbanColumn = ({ columnId, label, tickets, onCardClick }: KanbanColumnProps) => {
  const isDone = columnId === 'done';
  const style = columnStyles[columnId] || defaultStyle;

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <h3 className={`text-sm font-semibold ${style.header}`}>{label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tickets.length}
        </span>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-xl p-2 min-h-[200px] transition-colors border ${
              snapshot.isDraggingOver ? style.dropzoneActive : style.dropzone
            }`}
          >
            {tickets.map((ticket, index) => (
              <KanbanCard key={ticket.id} ticket={ticket} index={index} isDoneColumn={isDone} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
