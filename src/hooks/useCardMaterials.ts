import { useState, useEffect } from "react";
import { supabase } from "@/integrations/external-supabase/client";

export interface UploadedMaterial {
  id: string;
  card_key: string;
  file_path: string;
  file_name: string;
  display_label: string | null;
}

export function useCardMaterials() {
  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("card_materials")
        .select("*")
        .order("uploaded_at", { ascending: true });
      if (data) setMaterials(data as UploadedMaterial[]);
    };
    fetch();
  }, []);

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("materials").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getMaterialsByCard = (cardKey: string) =>
    materials
      .filter((m) => m.card_key === cardKey)
      .map((m) => ({
        label: m.display_label || m.file_name,
        url: getPublicUrl(m.file_path),
      }));

  return { materials, getMaterialsByCard };
}
