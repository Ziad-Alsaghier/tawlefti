DELETE FROM public.blend_compositions
WHERE ctid IN (
  SELECT ctid
  FROM (
    SELECT ctid,
           ROW_NUMBER() OVER(PARTITION BY blend_code, coffee_type_code ORDER BY ctid) as rn
    FROM public.blend_compositions
  ) t
  WHERE t.rn > 1
);