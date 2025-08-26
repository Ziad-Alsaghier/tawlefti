UPDATE public.blends
SET sensory_profile = '{"crema": 3, "body": 3, "acidity": 3, "bitterness": 3, "flavor": 3, "aroma": 3}'::jsonb
WHERE
    method_id = 'turkish'
    AND (sensory_profile IS NULL OR sensory_profile::text = '{}' OR sensory_profile::text = 'null');