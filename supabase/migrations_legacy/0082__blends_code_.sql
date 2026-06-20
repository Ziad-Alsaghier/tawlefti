ALTER TABLE public.blends DROP CONSTRAINT IF EXISTS blends_pkey CASCADE;
ALTER TABLE public.blends ADD PRIMARY KEY (code);
ALTER TABLE public.blends DROP COLUMN IF EXISTS method;
ALTER TABLE public.blends DROP COLUMN IF EXISTS sub_method;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS method_id TEXT;