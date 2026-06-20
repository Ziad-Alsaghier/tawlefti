CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  blend_code TEXT NOT NULL,
  blend_name_ar TEXT NOT NULL,
  roast TEXT NOT NULL,
  weight INTEGER NOT NULL,
  additives JSONB,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items."
ON public.carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items."
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items."
ON public.carts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items."
ON public.carts FOR DELETE
USING (auth.uid() = user_id);