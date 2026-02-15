import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CVUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [currentCV, setCurrentCV] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  const fetchCV = async () => {
    const { data } = await supabase.storage.from("cv").list("", { limit: 1 });
    if (data && data.length > 0) {
      setCurrentCV(data[0].name);
      const { data: urlData } = supabase.storage.from("cv").getPublicUrl(data[0].name);
      setCvUrl(urlData.publicUrl);
    } else {
      setCurrentCV(null);
      setCvUrl(null);
    }
  };

  useEffect(() => {
    fetchCV();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Remove existing CV first
      if (currentCV) {
        await supabase.storage.from("cv").remove([currentCV]);
      }
      const { error } = await supabase.storage.from("cv").upload(file.name, file, { upsert: true });
      if (error) throw error;
      toast.success("Resume uploaded successfully");
      fetchCV();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!currentCV) return;
    await supabase.storage.from("cv").remove([currentCV]);
    toast.success("Resume deleted");
    setCurrentCV(null);
    setCvUrl(null);
  };

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <h2 className="font-heading text-xl text-foreground mb-4">Resume</h2>

      <div className="flex items-center gap-3 mb-4">
        <label className="inline-flex items-center gap-2 rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors">
          {uploading ? "Uploading…" : "Upload Resume"}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {currentCV ? (
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <a
            href={cvUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {currentCV}
          </a>
          <button onClick={handleDelete} className="text-xs text-destructive hover:underline">
            Delete
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
      )}
    </div>
  );
};

export default CVUploader;
