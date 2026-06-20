CREATE OR REPLACE FUNCTION public.update_order_profit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.order_cost IS NOT NULL AND NEW.total_price IS NOT NULL THEN
    NEW.profit := NEW.total_price - NEW.order_cost;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_cost_update ON public.orders;

CREATE TRIGGER on_order_cost_update
  BEFORE UPDATE OF order_cost ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_profit();