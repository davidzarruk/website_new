import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { contentCalendarClient, type ContentItem } from '@/integrations/content-calendar/client';
import { Upload, X } from 'lucide-react';

const PILLARS = [
  { value: 'hot_take', label: 'Hot Take' },
  { value: 'el_dato', label: 'El Dato' },
  { value: 'sabias_que', label: 'Sabías Que' },
  { value: 'detras_del_dato', label: 'Detrás del Dato' },
  { value: 'en_la_calle', label: 'En la Calle' },
];

const STEPS = [
  { key: 'has_idea', label: '💡 Idea' },
  { key: 'has_script', label: '📝 Script' },
  { key: 'has_recording', label: '🎙️ Recorded' },
  { key: 'has_edit', label: '✂️ Edited' },
  { key: 'is_ready', label: '✅ Ready' },
] as const;

type StepKey = typeof STEPS[number]['key'];

interface ContentCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
  defaultDate?: string;
  onSave: (data: Partial<ContentItem>) => void;
  onDelete?: (id: string) => void;
}

const ContentCardModal = ({ open, onOpenChange, item, defaultDate, onSave, onDelete }: ContentCardModalProps) => {
  const [form, setForm] = useState({
    title: '', pillar: 'hot_take', scheduled_date: '', description: '', script: '',
    has_idea: false, has_script: false, has_recording: false, has_edit: false, is_ready: false,
    notes: '', instagram_caption: '', tiktok_caption: '', effort: 'low', image_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '', pillar: item.pillar || 'hot_take',
        scheduled_date: item.scheduled_date || '', description: item.description || '',
        script: item.script || '',
        has_idea: item.has_idea, has_script: item.has_script, has_recording: item.has_recording,
        has_edit: item.has_edit, is_ready: item.is_ready, notes: item.notes || '',
        instagram_caption: item.instagram_caption || '', tiktok_caption: item.tiktok_caption || '',
        effort: item.effort || 'low', image_url: item.image_url || '',
      });
    } else {
      setForm({
        title: '', pillar: 'hot_take', scheduled_date: defaultDate || '',
        description: '', script: '', has_idea: false, has_script: false, has_recording: false,
        has_edit: false, is_ready: false, notes: '', instagram_caption: '',
        tiktok_caption: '', effort: 'low', image_url: '',
      });
    }
  }, [item, defaultDate, open]);

  const handleStepChange = (key: StepKey, checked: boolean) => {
    const stepOrder: StepKey[] = ['has_idea', 'has_script', 'has_recording', 'has_edit', 'is_ready'];
    const idx = stepOrder.indexOf(key);
    const updated = { ...form };
    if (checked) {
      for (let i = 0; i <= idx; i++) updated[stepOrder[i]] = true;
    } else {
      for (let i = idx; i < stepOrder.length; i++) updated[stepOrder[i]] = false;
    }
    setForm(updated);
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await contentCalendarClient.storage.from('content-images').upload(path, file);
      if (error) throw error;
      const { data } = contentCalendarClient.storage.from('content-images').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
    } catch {
      // Fallback to base64
      const reader = new FileReader();
      reader.onload = (e) => setForm(f => ({ ...f, image_url: e.target?.result as string }));
      reader.readAsDataURL(file);
    }
    setUploading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleSave = () => {
    onSave({ ...form, ...(item ? { id: item.id } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Content' : 'New Content'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Pillar</Label>
              <Select value={form.pillar} onValueChange={(v) => setForm({ ...form, pillar: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PILLARS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Scheduled date</Label>
              <Input type="date" value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[60px]" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Script</Label>
            <Textarea value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })} className="min-h-[160px]" rows={6} />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Progress</Label>
            <div className="flex flex-wrap gap-3">
              {STEPS.map((s) => (
                <label key={s.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={form[s.key]}
                    onCheckedChange={(c) => handleStepChange(s.key, !!c)}
                  />
                  <span className="text-foreground">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Image</Label>
            {form.image_url ? (
              <div className="relative inline-block">
                <img src={form.image_url} alt="Content" className="rounded-md max-h-40 object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: '' })}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-accent transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">{uploading ? 'Uploading…' : 'Drag & drop or click to upload'}</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[50px]" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Instagram caption</Label>
            <Textarea value={form.instagram_caption} onChange={(e) => setForm({ ...form, instagram_caption: e.target.value })} className="min-h-[50px]" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">TikTok caption</Label>
            <Textarea value={form.tiktok_caption} onChange={(e) => setForm({ ...form, tiktok_caption: e.target.value })} className="min-h-[50px]" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Effort</Label>
            <Select value={form.effort} onValueChange={(v) => setForm({ ...form, effort: v })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          {item && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>Delete</Button>
          )}
          <Button onClick={handleSave} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentCardModal;
