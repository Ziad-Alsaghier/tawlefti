-- This command will delete all rows from both tables to make way for the new data.
-- It's important to clear blend_compositions first due to the relationship between the tables.
DELETE FROM public.blend_compositions;
DELETE FROM public.blends;