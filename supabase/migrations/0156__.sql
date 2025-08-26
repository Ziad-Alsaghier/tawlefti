-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blend_code TEXT NOT NULL REFERENCES public.blends(code) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, blend_code)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Public can read all reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
FOR DELETE TO authenticated USING (auth.uid() = user_id);