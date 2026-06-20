-- Function to add a new purchase and update stock automatically
CREATE OR REPLACE FUNCTION public.add_purchase_and_update_stock(
    p_item_type text,
    p_item_code text,
    p_quantity numeric,
    p_cost numeric,
    p_supplier text,
    p_notes text
)
RETURNS void AS $$
BEGIN
    -- Insert the purchase record
    INSERT INTO public.purchases(item_type, item_code, quantity, cost, supplier, notes)
    VALUES (p_item_type, p_item_code, p_quantity, p_cost, p_supplier, p_notes);

    -- Update the corresponding stock
    IF p_item_type = 'coffee' THEN
        UPDATE public.coffee_types
        SET stock_kg = stock_kg + p_quantity
        WHERE code = p_item_code;
    ELSIF p_item_type = 'additive' THEN
        UPDATE public.additives
        SET stock_grams = stock_grams + p_quantity
        WHERE id::text = p_item_code;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct stock when an order is processed
CREATE OR REPLACE FUNCTION public.deduct_stock_for_order(p_order_id uuid)
RETURNS void AS $$
DECLARE
    order_details record;
    blend_component record;
    additive_details record;
    grams_per_kg numeric := 1000;
    additive_grams_used numeric;
BEGIN
    -- Get order details
    SELECT * INTO order_details FROM public.orders WHERE id = p_order_id;

    -- Deduct coffee stock
    FOR blend_component IN
        SELECT bc.coffee_type_code, bc.percentage
        FROM public.blend_compositions bc
        WHERE bc.blend_code = order_details.blend_code
    LOOP
        UPDATE public.coffee_types
        SET stock_kg = stock_kg - (order_details.weight_grams / grams_per_kg * blend_component.percentage / 100)
        WHERE code = blend_component.coffee_type_code;
    END LOOP;

    -- Deduct additives stock
    IF order_details.additives IS NOT NULL AND array_length(order_details.additives, 1) > 0 THEN
        FOR additive_details IN
            SELECT id, name_ar FROM public.additives WHERE name_ar = ANY(order_details.additives)
        LOOP
            -- Assuming 5g of each additive is used per 250g of coffee
            additive_grams_used := (order_details.weight_grams / 250.0) * 5.0;
            UPDATE public.additives
            SET stock_grams = stock_grams - additive_grams_used
            WHERE id = additive_details.id;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;