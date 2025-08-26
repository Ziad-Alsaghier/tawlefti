DO $$
DECLARE
    costs_value jsonb;
BEGIN
    -- Select the current value for 'fixed_costs'
    SELECT value INTO costs_value FROM public.store_settings WHERE key = 'fixed_costs';

    -- Check if the value is a JSON object (the old format) and not an array
    IF jsonb_typeof(costs_value) = 'object' THEN
        -- Transform the object into an array of objects and add the new delivery cost
        UPDATE public.store_settings
        SET value = jsonb_build_array(
            jsonb_build_object('label', 'التعبئة والتغليف', 'value', COALESCE((costs_value->>'packaging')::numeric, 10)),
            jsonb_build_object('label', 'الطحن', 'value', COALESCE((costs_value->>'grinding')::numeric, 5)),
            jsonb_build_object('label', 'الأكياس والمواد الأخرى', 'value', COALESCE((costs_value->>'bags')::numeric, 5)),
            jsonb_build_object('label', 'التوصيل', 'value', 0) -- Add new delivery cost with a default of 0
        )
        WHERE key = 'fixed_costs';
    END IF;
END $$;