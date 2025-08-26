-- This function will be triggered after an order is inserted
CREATE OR REPLACE FUNCTION public.handle_order_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_change integer;
BEGIN
  -- Calculate the net change in points
  points_change := COALESCE(NEW.points_earned, 0) - COALESCE(NEW.points_redeemed, 0);

  -- If there's a change, update the customer's loyalty points
  IF points_change != 0 THEN
    INSERT INTO public.customer_loyalty (phone_number, points)
    VALUES (NEW.customer_phone, points_change)
    ON CONFLICT (phone_number)
    DO UPDATE SET
      points = customer_loyalty.points + points_change,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function after each new order
CREATE TRIGGER on_order_created_update_loyalty
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_loyalty_points();