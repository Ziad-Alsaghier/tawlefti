UPDATE public.blends
SET sensory_profile = jsonb_build_object(
    'crema', COALESCE(crema, 0),
    'body', COALESCE(body, 0),
    'acidity', COALESCE(acidity, 0),
    'bitterness', COALESCE(bitterness, 0),
    'flavor', COALESCE(flavor, 0),
    'aroma', COALESCE(aroma, 0)
)
WHERE method_id = 'turkish';