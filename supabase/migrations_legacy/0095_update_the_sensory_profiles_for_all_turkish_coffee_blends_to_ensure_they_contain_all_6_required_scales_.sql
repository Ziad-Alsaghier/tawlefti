BEGIN;

UPDATE public.blends 
SET sensory_profile = '{"crema":5, "body":5, "acidity":2, "bitterness":3, "flavor":4, "aroma":4}' 
WHERE code = 'T01';

UPDATE public.blends 
SET sensory_profile = '{"crema":5, "body":4, "acidity":3, "bitterness":2, "flavor":3, "aroma":3}' 
WHERE code = 'T02';

UPDATE public.blends 
SET sensory_profile = '{"crema":4, "body":4, "acidity":2, "bitterness":3, "flavor":5, "aroma":5}' 
WHERE code = 'T03';

UPDATE public.blends 
SET sensory_profile = '{"crema":3, "body":5, "acidity":1, "bitterness":5, "flavor":5, "aroma":3}' 
WHERE code = 'T04';

UPDATE public.blends 
SET sensory_profile = '{"crema":4, "body":3, "acidity":4, "bitterness":2, "flavor":4, "aroma":4}' 
WHERE code = 'T05';

COMMIT;