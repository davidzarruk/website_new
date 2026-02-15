
-- Create storage bucket for CV
INSERT INTO storage.buckets (id, name, public) VALUES ('cv', 'cv', true);

-- Public read for CV
CREATE POLICY "CV is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cv');

CREATE POLICY "Authenticated users can upload CV"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cv' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update CV"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cv' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete CV"
ON storage.objects FOR DELETE
USING (bucket_id = 'cv' AND auth.role() = 'authenticated');

-- Create storage bucket for course/project materials
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);

CREATE POLICY "Materials are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update materials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- Table to track materials per card
CREATE TABLE public.card_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_key TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  display_label TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card materials are publicly readable"
ON public.card_materials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert card materials"
ON public.card_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update card materials"
ON public.card_materials FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete card materials"
ON public.card_materials FOR DELETE USING (auth.role() = 'authenticated');
