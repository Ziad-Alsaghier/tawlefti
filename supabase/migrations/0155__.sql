-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blend_code TEXT NOT NULL REFERENCES public.blends(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, blend_code)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for wishlist
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist
FOR DELETE TO authenticated USING (auth.uid() = user_id);