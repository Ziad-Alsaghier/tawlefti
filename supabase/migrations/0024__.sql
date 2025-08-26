-- Verify that the data has been linked by showing the names from all three tables.
SELECT 
    b.name_ar AS blend_name, 
    ct.name_ar AS coffee_type_name, 
    bc.percentage
FROM 
    public.blend_compositions bc
JOIN 
    public.blends b ON bc.blend_id = b.id
JOIN 
    public.coffee_types ct ON bc.coffee_type_id = ct.id
LIMIT 10;