import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TalkOption {
  key: string;
  label: string;
}

const TALKS: TalkOption[] = [
  { key: "icml-2024", label: "ICML — Latin x AI (2024)" },
  { key: "scecr-2023", label: "Symposium on Statistical Challenges (2023)" },
  { key: "pasc-2019", label: "PASC Conference (2019)" },
  { key: "workshop-2025", label: "Workshop Porto (2025)" },
];

interface SlideRecord {
  talk_key: string;
  file_name: string;
  file_path: string;
}

const SlideUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedTalk, setSelectedTalk] = useState(TALKS[0].key);
  const [existingSlides, setExistingSlides] = useState<SlideRecord[]>([]);

  const fetchSlides = async () => {
    const { data } = await supabase.from("talk_slides").select("*");
    if (data) setExistingSlides(data as SlideRecord[]);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${selectedTalk}/${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("talk-slides")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Upsert metadata
      const { error: dbError } = await supabase
        .from("talk_slides")
        .upsert(
          { talk_key: selectedTalk, file_path: filePath, file_name: file.name },
          { onConflict: "talk_key" }
        );

      if (dbError) throw dbError;

      toast.success(`Slides uploaded for ${TALKS.find((t) => t.key === selectedTalk)?.label}`);
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (slide: SlideRecord) => {
    await supabase.storage.from("talk-slides").remove([slide.file_path]);
    await supabase.from("talk_slides").delete().eq("talk_key", slide.talk_key);
    toast.success("Slide deleted");
    fetchSlides();
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("talk-slides").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <h2 className="font-heading text-xl text-foreground mb-4">Talk Slides</h2>

      {/* Upload form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={selectedTalk}
          onChange={(e) => setSelectedTalk(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {TALKS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors">
          {uploading ? "Uploading…" : "Upload Slides"}
          <input
            type="file"
            accept=".pdf,.pptx,.ppt"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Existing slides */}
      {existingSlides.length > 0 && (
        <div className="space-y-3">
          {existingSlides.map((slide) => {
            const talk = TALKS.find((t) => t.key === slide.talk_key);
            return (
              <div
                key={slide.talk_key}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{talk?.label ?? slide.talk_key}</p>
                  <a
                    href={getPublicUrl(slide.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    {slide.file_name}
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(slide)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {existingSlides.length === 0 && (
        <p className="text-sm text-muted-foreground">No slides uploaded yet.</p>
      )}
    </div>
  );
};

export default SlideUploader;
