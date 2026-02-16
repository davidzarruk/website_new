import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Ticket } from '@/integrations/kanban/client';

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

interface KanbanCardDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KanbanCardDialog = ({ ticket, open, onOpenChange }: KanbanCardDialogProps) => {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
            {ticket.priority && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[ticket.priority.toLowerCase()] || ''}`}>
                {ticket.priority}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-base">{ticket.title}</DialogTitle>
        </DialogHeader>

        {ticket.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {ticket.role && (
            <Badge variant="secondary" className="text-xs">{ticket.role}</Badge>
          )}
          {ticket.assignee && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" /> {ticket.assignee}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
          </span>
          {ticket.completed_at && (
            <span className="flex items-center gap-1">
              ✓ Completed {format(new Date(ticket.completed_at), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanCardDialog;
