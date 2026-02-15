
-- Create storage bucket for talk slides
INSERT INTO storage.buckets (id, name, public) VALUES ('talk-slides', 'talk-slides', true);

-- Allow public read access to slides
CREATE POLICY "Talk slides are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'talk-slides');

-- Allow authenticated users to upload slides
CREATE POLICY "Authenticated users can upload slides"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'talk-slides' AND auth.role() = 'authenticated');

-- Allow authenticated users to update slides
CREATE POLICY "Authenticated users can update slides"
ON storage.objects FOR UPDATE
USING (bucket_id = 'talk-slides' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete slides
CREATE POLICY "Authenticated users can delete slides"
ON storage.objects FOR DELETE
USING (bucket_id = 'talk-slides' AND auth.role() = 'authenticated');

-- Create a table to track which slides belong to which talk
CREATE TABLE public.talk_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talk_key TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.talk_slides ENABLE ROW LEVEL SECURITY;

-- Public read access for talk_slides
CREATE POLICY "Talk slides metadata is publicly readable"
ON public.talk_slides FOR SELECT
USING (true);

-- Only authenticated users can manage slides
CREATE POLICY "Authenticated users can insert talk slides"
ON public.talk_slides FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update talk slides"
ON public.talk_slides FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete talk slides"
ON public.talk_slides FOR DELETE
USING (auth.role() = 'authenticated');
