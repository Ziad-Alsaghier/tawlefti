CREATE OR REPLACE FUNCTION public.add_purchase_and_update_stock(p_item_type text, p_item_code text, p_quantity numeric, p_cost numeric, p_supplier text, p_notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Insert the purchase record
    INSERT INTO public.purchases(item_type, item_code, quantity, cost, supplier, notes)
    VALUES (p_item_type, p_item_code, p_quantity, p_cost, p_supplier, p_notes);

    -- Update the corresponding stock
    IF p_item_type = 'coffee' THEN
        UPDATE public.coffee_types
        SET stock_green_kg = stock_green_kg + p_quantity
        WHERE code = p_item_code;
    ELSIF p_item_type = 'additive' THEN
        UPDATE public.additives
        SET stock_grams = stock_grams + p_quantity
        WHERE id::text = p_item_code;
    END IF;
END;
$function$