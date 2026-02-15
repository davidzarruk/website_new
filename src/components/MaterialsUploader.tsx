import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CardOption {
  key: string;
  label: string;
}

const CARDS: CardOption[] = [
  // Teaching
  { key: "fiscal-policy", label: "Teaching: Fiscal Policy and Theory" },
  { key: "advanced-methods", label: "Teaching: Advanced Methods for Data Analysis" },
  { key: "predictive-analytics", label: "Teaching: Predictive Analytics" },
  { key: "economia-5", label: "Teaching: Economía 5 — Intermediate Macroeconomics" },
  { key: "dynamic-macro", label: "Teaching: Dynamic Macroeconomics I" },
  { key: "math-camp", label: "Teaching: Summer Math Camp (ECON 897)" },
  { key: "matlab-workshop", label: "Teaching: MATLAB Workshop (ECON 1303)" },
  // Projects
  { key: "computational-methods", label: "Project: Computational Methods for Economists" },
  { key: "la-rama-ciudadana", label: "Project: La Rama Ciudadana" },
  { key: "gmapsdistance", label: "Project: gmapsdistance" },
  { key: "rtauchen", label: "Project: Rtauchen" },
  { key: "berlin-marathon-ai", label: "Project: Berlin Marathon AI" },
];

interface MaterialRecord {
  id: string;
  card_key: string;
  file_path: string;
  file_name: string;
  display_label: string | null;
}

const MaterialsUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(CARDS[0].key);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from("card_materials")
      .select("*")
      .order("uploaded_at", { ascending: true });
    if (data) setMaterials(data as MaterialRecord[]);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const filePath = `${selectedCard}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("card_materials").insert({
          card_key: selectedCard,
          file_path: filePath,
          file_name: file.name,
          display_label: file.name.replace(/\.[^/.]+$/, ""),
        });

        if (dbError) throw dbError;
      }

      toast.success(`${files.length} file(s) uploaded`);
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (material: MaterialRecord) => {
    await supabase.storage.from("materials").remove([material.file_path]);
    await supabase.from("card_materials").delete().eq("id", material.id);
    toast.success("File deleted");
    fetchMaterials();
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("materials").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const filteredMaterials = materials.filter((m) => m.card_key === selectedCard);

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <h2 className="font-heading text-xl text-foreground mb-4">Course & Project Materials</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground flex-1"
        >
          {CARDS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors shrink-0">
          {uploading ? "Uploading…" : "Upload Files"}
          <input
            type="file"
            multiple
            accept=".pdf,.pptx,.ppt,.doc,.docx,.xlsx,.xls,.zip,.r,.py,.jl,.m,.tex,.txt,.csv"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="flex items-center justify-between rounded-lg border border-border p-2.5"
            >
              <a
                href={getPublicUrl(mat.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline truncate mr-2"
              >
                {mat.display_label || mat.file_name}
              </a>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getPublicUrl(mat.file_path)}
                  download
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ↓ Download
                </a>
                <button
                  onClick={() => handleDelete(mat)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No materials uploaded for this card yet.
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        💡 You can select multiple files at once for bulk upload.
      </p>
    </div>
  );
};

export default MaterialsUploader;
