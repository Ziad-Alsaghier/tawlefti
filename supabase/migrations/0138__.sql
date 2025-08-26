CREATE OR REPLACE FUNCTION public.calculate_order_cost_and_profit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_coffee_cost NUMERIC := 0;
    v_additives_cost NUMERIC := 0;
    v_fixed_costs_json JSONB;
    v_packaging_cost NUMERIC;
    v_grinding_cost NUMERIC;
    v_bags_cost NUMERIC;
    v_total_fixed_costs NUMERIC;
    v_total_order_cost NUMERIC;
    v_profit NUMERIC;
    comp RECORD;
    coffee_type_cost_roasted_kg NUMERIC;
    additive_detail RECORD;
    v_grams_additive_per_250g_coffee NUMERIC := 5.0;
    v_grams_of_additive_used_in_order NUMERIC;
BEGIN
    -- Fetch fixed costs from store_settings
    SELECT value INTO v_fixed_costs_json FROM public.store_settings WHERE key = 'fixed_costs' LIMIT 1;
    
    -- Use default values if not found in settings
    v_packaging_cost := COALESCE((v_fixed_costs_json ->> 'packaging')::NUMERIC, 10);
    v_grinding_cost := COALESCE((v_fixed_costs_json ->> 'grinding')::NUMERIC, 5);
    v_bags_cost := COALESCE((v_fixed_costs_json ->> 'bags')::NUMERIC, 5);
    v_total_fixed_costs := v_packaging_cost + v_grinding_cost + v_bags_cost;

    -- Calculate coffee cost based on the final roasted price provided by the user
    IF NEW.blend_code IS NOT NULL AND NEW.weight_grams IS NOT NULL AND NEW.roast_level IS NOT NULL THEN
        FOR comp IN
            SELECT bc.coffee_type_code, bc.percentage
            FROM public.blend_compositions bc
            WHERE bc.blend_code = NEW.blend_code
        LOOP
            -- Dynamically select the correct roasted price column (price_light_kg, price_medium_kg, or price_dark_kg)
            EXECUTE format('SELECT %I FROM public.coffee_types WHERE code = %L', 
                           'price_' || NEW.roast_level || '_kg', 
                           comp.coffee_type_code)
            INTO coffee_type_cost_roasted_kg;

            IF FOUND AND coffee_type_cost_roasted_kg IS NOT NULL THEN
                DECLARE
                    component_weight_kg NUMERIC := (NEW.weight_grams / 1000.0) * (comp.percentage / 100.0);
                BEGIN
                    v_coffee_cost := v_coffee_cost + (coffee_type_cost_roasted_kg * component_weight_kg);
                END;
            END IF;
        END LOOP;
    END IF;

    -- Calculate additives cost (this part remains correct)
    IF NEW.additives IS NOT NULL AND array_length(NEW.additives, 1) > 0 THEN
        v_grams_of_additive_used_in_order := (NEW.weight_grams / 250.0) * v_grams_additive_per_250g_coffee;

        FOR additive_detail IN
            SELECT a.cost_per_250g
            FROM public.additives a
            WHERE a.name_ar = ANY(NEW.additives)
        LOOP
            IF additive_detail.cost_per_250g IS NOT NULL THEN
                DECLARE
                    cost_per_gram_of_additive NUMERIC := additive_detail.cost_per_250g / 250.0;
                BEGIN
                    v_additives_cost := v_additives_cost + (cost_per_gram_of_additive * v_grams_of_additive_used_in_order);
                END;
            END IF;
        END LOOP;
    END IF;

    -- Calculate total order cost
    v_total_order_cost := v_coffee_cost + v_additives_cost + v_total_fixed_costs;

    -- Calculate profit
    v_profit := NEW.total_price - v_total_order_cost;

    -- Update the new order row
    NEW.order_cost := v_total_order_cost;
    NEW.profit := v_profit;

    RETURN NEW;
END;
$function$