-- Step 1: Modify the coffee_types table to track different stock levels
ALTER TABLE public.coffee_types
  RENAME COLUMN stock_kg TO stock_green_kg;

ALTER TABLE public.coffee_types
  ADD COLUMN stock_light_kg numeric NOT NULL DEFAULT 0,
  ADD COLUMN stock_medium_kg numeric NOT NULL DEFAULT 0,
  ADD COLUMN stock_dark_kg numeric NOT NULL DEFAULT 0;

-- Step 2: Create the roasting_sessions table to log all roasting activities
CREATE TABLE public.roasting_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  coffee_type_code text NOT NULL REFERENCES public.coffee_types(code) ON DELETE CASCADE,
  roast_level text NOT NULL,
  green_kg_in numeric NOT NULL,
  roasted_kg_out numeric NOT NULL,
  roasted_by uuid REFERENCES auth.users(id)
);

-- Step 3: Enable Row Level Security and create policies for the new table
ALTER TABLE public.roasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roasting sessions" ON public.roasting_sessions
  FOR ALL
  USING (get_user_role() = 'admin'::text);

CREATE POLICY "Roasters can view and create their own sessions" ON public.roasting_sessions
  FOR ALL
  USING (get_user_role() = 'roaster'::text AND roasted_by = auth.uid());

-- Step 4: Create a function to process a roast session (will be used later)
CREATE OR REPLACE FUNCTION public.process_roast_session(
  p_coffee_code text,
  p_green_kg_in numeric,
  p_roast_level text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  weight_loss_factor numeric := 0.82; -- Assuming 18% weight loss
  v_roasted_kg_out numeric;
BEGIN
  -- Calculate roasted weight
  v_roasted_kg_out := p_green_kg_in * weight_loss_factor;

  -- Decrement green stock
  UPDATE public.coffee_types
  SET stock_green_kg = stock_green_kg - p_green_kg_in
  WHERE code = p_coffee_code;

  -- Increment roasted stock based on level
  IF p_roast_level = 'light' THEN
    UPDATE public.coffee_types SET stock_light_kg = stock_light_kg + v_roasted_kg_out WHERE code = p_coffee_code;
  ELSIF p_roast_level = 'medium' THEN
    UPDATE public.coffee_types SET stock_medium_kg = stock_medium_kg + v_roasted_kg_out WHERE code = p_coffee_code;
  ELSIF p_roast_level = 'dark' THEN
    UPDATE public.coffee_types SET stock_dark_kg = stock_dark_kg + v_roasted_kg_out WHERE code = p_coffee_code;
  END IF;

  -- Log the session
  INSERT INTO public.roasting_sessions(coffee_type_code, roast_level, green_kg_in, roasted_kg_out, roasted_by)
  VALUES(p_coffee_code, p_roast_level, p_green_kg_in, v_roasted_kg_out, auth.uid());
END;
$$;

-- Step 5: Update the stock deduction function for orders to use new roasted stock columns
CREATE OR REPLACE FUNCTION public.deduct_stock_for_order(p_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    order_details record;
    blend_component record;
    additive_details record;
    grams_per_kg numeric := 1000;
    additive_grams_used numeric;
    v_weight_to_deduct_kg numeric;
BEGIN
    -- Get order details
    SELECT * INTO order_details FROM public.orders WHERE id = p_order_id;

    -- Deduct coffee stock from the appropriate roasted stock
    FOR blend_component IN
        SELECT bc.coffee_type_code, bc.percentage
        FROM public.blend_compositions bc
        WHERE bc.blend_code = order_details.blend_code
    LOOP
        v_weight_to_deduct_kg := (order_details.weight_grams / grams_per_kg * blend_component.percentage / 100);

        IF order_details.roast_level = 'light' THEN
            UPDATE public.coffee_types SET stock_light_kg = stock_light_kg - v_weight_to_deduct_kg WHERE code = blend_component.coffee_type_code;
        ELSIF order_details.roast_level = 'medium' THEN
            UPDATE public.coffee_types SET stock_medium_kg = stock_medium_kg - v_weight_to_deduct_kg WHERE code = blend_component.coffee_type_code;
        ELSIF order_details.roast_level = 'dark' THEN
            UPDATE public.coffee_types SET stock_dark_kg = stock_dark_kg - v_weight_to_deduct_kg WHERE code = blend_component.coffee_type_code;
        END IF;
    END LOOP;

    -- Deduct additives stock (this part remains the same)
    IF order_details.additives IS NOT NULL AND array_length(order_details.additives, 1) > 0 THEN
        FOR additive_details IN
            SELECT id, name_ar FROM public.additives WHERE name_ar = ANY(order_details.additives)
        LOOP
            additive_grams_used := (order_details.weight_grams / 250.0) * 5.0;
            UPDATE public.additives
            SET stock_grams = stock_grams - additive_grams_used
            WHERE id = additive_details.id;
        END LOOP;
    END IF;
END;
$function$;