-- الخطوة 1: إضافة حقل جديد لتكلفة التحويجات
ALTER TABLE public.additives ADD COLUMN cost_per_250g NUMERIC NOT NULL DEFAULT 0;
COMMENT ON COLUMN public.additives.cost_per_250g IS 'The actual cost of 250g of the additive, for profit calculation.';

-- الخطوة 2: تحديث دالة حساب التكلفة والربح لتستخدم الحقل الجديد
CREATE OR REPLACE FUNCTION public.calculate_order_cost_and_profit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_coffee_cost NUMERIC := 0;
    v_additives_cost NUMERIC := 0;
    v_fixed_costs NUMERIC := 20; -- Fixed cost per order
    v_total_order_cost NUMERIC;
    v_profit NUMERIC;
    v_roasted_yield_factor NUMERIC := 0.82; -- Assuming 18% weight loss
    comp RECORD;
    coffee_type_price_green_kg NUMERIC;
    additive_detail RECORD;
    v_grams_additive_per_250g_coffee NUMERIC := 5.0;
    v_grams_of_additive_used_in_order NUMERIC;
BEGIN
    -- Calculate coffee cost
    IF NEW.blend_code IS NOT NULL AND NEW.weight_grams IS NOT NULL THEN
        FOR comp IN
            SELECT bc.coffee_type_code, bc.percentage
            FROM public.blend_compositions bc
            WHERE bc.blend_code = NEW.blend_code
        LOOP
            SELECT ct.price_green_kg INTO coffee_type_price_green_kg
            FROM public.coffee_types ct
            WHERE ct.code = comp.coffee_type_code;

            IF FOUND AND coffee_type_price_green_kg IS NOT NULL THEN
                DECLARE
                    cost_per_kg_roasted NUMERIC := coffee_type_price_green_kg / v_roasted_yield_factor;
                    component_weight_kg NUMERIC := (NEW.weight_grams / 1000.0) * (comp.percentage / 100.0);
                BEGIN
                    v_coffee_cost := v_coffee_cost + (cost_per_kg_roasted * component_weight_kg);
                END;
            END IF;
        END LOOP;
    END IF;

    -- Calculate additives cost using the new cost_per_250g column
    IF NEW.additives IS NOT NULL AND array_length(NEW.additives, 1) > 0 THEN
        v_grams_of_additive_used_in_order := (NEW.weight_grams / 250.0) * v_grams_additive_per_250g_coffee;

        FOR additive_detail IN
            SELECT a.cost_per_250g -- Changed from price_per_250g
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
    v_total_order_cost := v_coffee_cost + v_additives_cost + v_fixed_costs;

    -- Calculate profit
    v_profit := NEW.total_price - v_total_order_cost;

    -- Update the new order row
    NEW.order_cost := v_total_order_cost;
    NEW.profit := v_profit;

    RETURN NEW;
END;
$function$;