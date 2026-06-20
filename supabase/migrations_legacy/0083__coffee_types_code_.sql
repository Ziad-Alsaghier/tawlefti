ALTER TABLE public.coffee_types DROP CONSTRAINT IF EXISTS coffee_types_pkey CASCADE;
ALTER TABLE public.coffee_types ADD PRIMARY KEY (code);