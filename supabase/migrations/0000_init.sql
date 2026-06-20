-- Baseline public schema extracted from database backup (2025-10-16).
-- Preserves existing design; historical migrations are archived under supabase/migrations_legacy/.

CREATE TABLE public.additives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    price_per_250g numeric NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    stock_grams numeric DEFAULT 0,
    cost_per_250g numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.additives OWNER TO postgres;

--

CREATE TABLE public.banned_phones (
    phone_number text NOT NULL,
    reason text,
    banned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banned_phones OWNER TO postgres;

--

CREATE TABLE public.blend_compositions (
    id bigint NOT NULL,
    blend_code text NOT NULL,
    coffee_type_code text NOT NULL,
    percentage smallint NOT NULL
);


ALTER TABLE public.blend_compositions OWNER TO postgres;

--

CREATE TABLE public.blends (
    code text NOT NULL,
    name_ar text NOT NULL,
    name_en text,
    notes_ar text,
    notes_en text,
    roast_profile text,
    sensory_profile jsonb,
    method_id text,
    is_active boolean DEFAULT true,
    preparation_notes_ar text,
    preparation_notes_en text,
    manual_price numeric,
    display_category text,
    available_additive_ids uuid[]
);


ALTER TABLE public.blends OWNER TO postgres;

--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    blend_code text NOT NULL,
    blend_name_ar text NOT NULL,
    roast text NOT NULL,
    weight integer NOT NULL,
    additives jsonb,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT carts_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.carts OWNER TO postgres;

--

CREATE TABLE public.coffee_types (
    code text NOT NULL,
    name_ar text NOT NULL,
    name_en text,
    is_active boolean DEFAULT true,
    price_green_kg numeric DEFAULT 0.00,
    price_light_kg numeric DEFAULT 0.00,
    price_medium_kg numeric DEFAULT 0.00,
    price_dark_kg numeric DEFAULT 0.00,
    stock_green_kg numeric DEFAULT 0,
    stock_light_kg numeric DEFAULT 0 NOT NULL,
    stock_medium_kg numeric DEFAULT 0 NOT NULL,
    stock_dark_kg numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.coffee_types OWNER TO postgres;

--

CREATE TABLE public.customer_loyalty (
    phone_number text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_loyalty OWNER TO postgres;

--

CREATE TABLE public.discount_codes (
    id bigint NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value numeric NOT NULL,
    expires_at timestamp with time zone,
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.discount_codes OWNER TO postgres;

--

CREATE TABLE public.expense_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    description_ar text,
    description_en text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expense_categories OWNER TO postgres;

--

CREATE TABLE public.fixed_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    amount numeric NOT NULL,
    category_id uuid,
    frequency text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.fixed_expenses OWNER TO postgres;

--

CREATE TABLE public.loyalty_log (
    id bigint NOT NULL,
    customer_phone text NOT NULL,
    points_change integer NOT NULL,
    reason text,
    admin_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.loyalty_log OWNER TO postgres;

--

CREATE TABLE public.method_status (
    method_id text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    profit_margin numeric DEFAULT 1.4
);


ALTER TABLE public.method_status OWNER TO postgres;

--

CREATE TABLE public.notification_templates (
    status text NOT NULL,
    is_active text DEFAULT 'processing'::text NOT NULL,
    title_template text NOT NULL,
    body_template text NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    user_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'unread'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_status_check CHECK ((status = ANY (ARRAY['unread'::text, 'read'::text])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text NOT NULL,
    blend_name text NOT NULL,
    blend_code text,
    roast_level text,
    weight_grams integer,
    additives text[],
    total_price numeric,
    status text DEFAULT 'pending'::text,
    order_cost numeric,
    profit numeric,
    discount_code text,
    discount_amount numeric,
    points_earned integer,
    points_redeemed integer,
    user_id uuid,
    cancel_reason text,
    delivery_slot text,
    subscription_id uuid
);


ALTER TABLE public.orders OWNER TO postgres;

--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role text,
    full_name text,
    phone_number text,
    address text,
    admin_notes text
);


ALTER TABLE public.profiles OWNER TO postgres;

--

CREATE TABLE public.purchases (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    item_type text NOT NULL,
    item_code text NOT NULL,
    quantity numeric NOT NULL,
    cost numeric NOT NULL,
    supplier text,
    notes text,
    supplier_id uuid
);


ALTER TABLE public.purchases OWNER TO postgres;

--

CREATE TABLE public.push_subscriptions (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    subscription jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    blend_code text NOT NULL,
    rating smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--

CREATE TABLE public.roastery_payouts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    payout_amount numeric NOT NULL,
    payout_date timestamp with time zone DEFAULT now() NOT NULL,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roastery_payouts OWNER TO postgres;

--

CREATE TABLE public.roasting_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    coffee_type_code text NOT NULL,
    roast_level text NOT NULL,
    green_kg_in numeric NOT NULL,
    roasted_kg_out numeric NOT NULL,
    roasted_by uuid
);


ALTER TABLE public.roasting_sessions OWNER TO postgres;

--

CREATE TABLE public.salaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_name text NOT NULL,
    salary_amount numeric NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.salaries OWNER TO postgres;

--

CREATE TABLE public.salary_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salary_id uuid NOT NULL,
    payment_date date NOT NULL,
    amount_paid numeric NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.salary_payments OWNER TO postgres;

--

CREATE TABLE public.site_content (
    key text NOT NULL,
    value jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_content OWNER TO postgres;

--

CREATE TABLE public.store_settings (
    key text NOT NULL,
    value jsonb,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.store_settings OWNER TO postgres;

--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    duration_months integer NOT NULL,
    discount_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    blend_code text NOT NULL,
    roast_level text NOT NULL,
    weight_grams integer NOT NULL,
    additives text[],
    frequency_days integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    next_delivery_date date NOT NULL,
    shipping_address text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text, 'payment_failed'::text])))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--

CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    contact_person text,
    phone text,
    email text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.suppliers OWNER TO postgres;

--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date DEFAULT now() NOT NULL,
    type text NOT NULL,
    category_id uuid,
    amount numeric NOT NULL,
    description text NOT NULL,
    related_order_id uuid,
    related_purchase_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    blend_code text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wishlist OWNER TO postgres;

--

COMMENT ON COLUMN public.additives.cost_per_250g IS 'The actual cost of 250g of the additive, for profit calculation.';


--

COMMENT ON COLUMN public.profiles.admin_notes IS 'Administrative notes for CRM purposes, only visible to admins.';


--

COMMENT ON COLUMN public.profiles.role IS 'admin';


--

COMMENT ON TABLE public.blend_compositions IS 'جدول الربط بين التوليفات وأنواع البن المكونة لها.';


--

COMMENT ON TABLE public.blends IS 'جدول جميع التوليفات النهائية من كل المكتبات.';


--

COMMENT ON TABLE public.coffee_types IS 'جدول أنواع حبوب البن الخام وأسعارها.';


--

ALTER TABLE public.blend_compositions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.blend_compositions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--

ALTER TABLE public.discount_codes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.discount_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--

ALTER TABLE public.loyalty_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.loyalty_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--

ALTER TABLE public.purchases ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--

ALTER TABLE public.push_subscriptions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.push_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--

ALTER TABLE ONLY public.additives
    ADD CONSTRAINT additives_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.banned_phones
    ADD CONSTRAINT banned_phones_pkey PRIMARY KEY (phone_number);


--

ALTER TABLE ONLY public.blend_compositions
    ADD CONSTRAINT blend_compositions_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.blends
    ADD CONSTRAINT blends_pkey PRIMARY KEY (code);


--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.coffee_types
    ADD CONSTRAINT coffee_types_name_ar_key UNIQUE (name_ar);


--

ALTER TABLE ONLY public.coffee_types
    ADD CONSTRAINT coffee_types_pkey PRIMARY KEY (code);


--

ALTER TABLE ONLY public.customer_loyalty
    ADD CONSTRAINT customer_loyalty_pkey PRIMARY KEY (phone_number);


--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_key UNIQUE (code);


--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_name_ar_key UNIQUE (name_ar);


--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_name_en_key UNIQUE (name_en);


--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.fixed_expenses
    ADD CONSTRAINT fixed_expenses_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.loyalty_log
    ADD CONSTRAINT loyalty_log_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.method_status
    ADD CONSTRAINT method_status_pkey PRIMARY KEY (method_id);


--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (status);


--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_key UNIQUE (user_id);


--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_blend_code_key UNIQUE (user_id, blend_code);


--

ALTER TABLE ONLY public.roastery_payouts
    ADD CONSTRAINT roastery_payouts_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.roasting_sessions
    ADD CONSTRAINT roasting_sessions_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (key);


--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_pkey PRIMARY KEY (key);


--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT unique_name_ar UNIQUE (name_ar);


--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_blend_code_key UNIQUE (user_id, blend_code);


--

ALTER TABLE ONLY public.blend_compositions
    ADD CONSTRAINT blend_compositions_blend_code_fkey FOREIGN KEY (blend_code) REFERENCES public.blends(code) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.blend_compositions
    ADD CONSTRAINT blend_compositions_coffee_type_code_fkey FOREIGN KEY (coffee_type_code) REFERENCES public.coffee_types(code) ON DELETE RESTRICT;


--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.fixed_expenses
    ADD CONSTRAINT fixed_expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.loyalty_log
    ADD CONSTRAINT loyalty_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_blend_code_fkey FOREIGN KEY (blend_code) REFERENCES public.blends(code) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.roastery_payouts
    ADD CONSTRAINT fk_recorded_by_profile FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.roastery_payouts
    ADD CONSTRAINT roastery_payouts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.roastery_payouts
    ADD CONSTRAINT roastery_payouts_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.roasting_sessions
    ADD CONSTRAINT roasting_sessions_coffee_type_code_fkey FOREIGN KEY (coffee_type_code) REFERENCES public.coffee_types(code) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.roasting_sessions
    ADD CONSTRAINT roasting_sessions_roasted_by_fkey FOREIGN KEY (roasted_by) REFERENCES auth.users(id);


--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_salary_id_fkey FOREIGN KEY (salary_id) REFERENCES public.salaries(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_blend_code_fkey FOREIGN KEY (blend_code) REFERENCES public.blends(code) ON DELETE RESTRICT;


--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_related_purchase_id_fkey FOREIGN KEY (related_purchase_id) REFERENCES public.purchases(id) ON DELETE SET NULL;


--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_blend_code_fkey FOREIGN KEY (blend_code) REFERENCES public.blends(code) ON DELETE CASCADE;


--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--

CREATE FUNCTION public.add_purchase_and_update_stock(p_item_type text, p_item_code text, p_quantity numeric, p_cost numeric, p_supplier text, p_notes text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION public.add_purchase_and_update_stock(p_item_type text, p_item_code text, p_quantity numeric, p_cost numeric, p_supplier text, p_notes text) OWNER TO postgres;

--

CREATE FUNCTION public.add_purchase_and_update_stock(p_item_type text, p_item_code text, p_quantity numeric, p_cost numeric, p_supplier_id uuid, p_notes text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_supplier_name TEXT;
BEGIN
    -- Get supplier name to store in the old column for compatibility
    SELECT name INTO v_supplier_name FROM public.suppliers WHERE id = p_supplier_id;

    -- Insert the purchase record
    INSERT INTO public.purchases(item_type, item_code, quantity, cost, supplier_id, supplier, notes)
    VALUES (p_item_type, p_item_code, p_quantity, p_cost, p_supplier_id, v_supplier_name, p_notes);

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
$$;


ALTER FUNCTION public.add_purchase_and_update_stock(p_item_type text, p_item_code text, p_quantity numeric, p_cost numeric, p_supplier_id uuid, p_notes text) OWNER TO postgres;

--

CREATE FUNCTION public.calculate_order_cost_and_profit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
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
$$;


ALTER FUNCTION public.calculate_order_cost_and_profit() OWNER TO postgres;

--

CREATE FUNCTION public.deduct_stock_for_order(p_order_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION public.deduct_stock_for_order(p_order_id uuid) OWNER TO postgres;

--

CREATE FUNCTION public.get_dashboard_charts_data(start_date date, end_date date) RETURNS json
    LANGUAGE sql
    AS $$
WITH daily_revenue_data AS (
    SELECT
        json_agg(
            json_build_object(
                'date', TO_CHAR(d.day, 'YYYY-MM-DD'),
                'revenue', COALESCE(o.daily_revenue, 0),
                'profit', COALESCE(o.daily_profit, 0)
            ) ORDER BY d.day
        ) as daily_revenue
    FROM generate_series(start_date, end_date, '1 day'::interval) d(day)
    LEFT JOIN (
        SELECT
            created_at::date as order_date,
            SUM(total_price) as daily_revenue,
            SUM(profit) as daily_profit
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date + interval '1 day'
        GROUP BY order_date
    ) o ON d.day::date = o.order_date
),
order_status_data AS (
    SELECT
        json_agg(
            json_build_object(
                'status', status,
                'count', count
            )
        ) as order_status_counts
    FROM (
        SELECT
            status,
            COUNT(*) as count
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date + interval '1 day'
        GROUP BY status
    ) s
),
top_blends_data AS (
    SELECT
        json_agg(
            json_build_object(
                'blend_name', blend_name,
                'profit', total_profit
            )
        ) as top_profitable_blends
    FROM (
        SELECT
            blend_name,
            SUM(profit) as total_profit
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date + interval '1 day' AND profit IS NOT NULL
        GROUP BY blend_name
        ORDER BY total_profit DESC
        LIMIT 5
    ) t
),
customer_type_data AS (
    SELECT
        json_build_object(
            'new', COALESCE(SUM(CASE WHEN cl.phone_number IS NULL AND cir.order_count = 1 THEN 1 ELSE 0 END), 0),
            'returning', COALESCE(SUM(CASE WHEN cl.phone_number IS NULL AND cir.order_count > 1 THEN 1 ELSE 0 END), 0),
            'loyal', COALESCE(SUM(CASE WHEN cl.phone_number IS NOT NULL THEN 1 ELSE 0 END), 0)
        ) as customer_types
    FROM (
        SELECT
            customer_phone,
            COUNT(*) as order_count
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date + interval '1 day'
        GROUP BY customer_phone
    ) cir
    LEFT JOIN public.customer_loyalty cl ON cir.customer_phone = cl.phone_number
)
SELECT
    json_build_object(
        'daily_revenue', (SELECT daily_revenue FROM daily_revenue_data),
        'order_status_counts', (SELECT order_status_counts FROM order_status_data),
        'top_profitable_blends', (SELECT top_profitable_blends FROM top_blends_data),
        'customer_types', (SELECT customer_types FROM customer_type_data)
    );
$$;


ALTER FUNCTION public.get_dashboard_charts_data(start_date date, end_date date) OWNER TO postgres;

--

CREATE FUNCTION public.get_dashboard_charts_data(start_date_ts timestamp with time zone, end_date_ts timestamp with time zone) RETURNS json
    LANGUAGE sql
    AS $$
WITH daily_revenue_data AS (
    SELECT
        json_agg(
            json_build_object(
                'date', TO_CHAR(d.day, 'YYYY-MM-DD'),
                'revenue', COALESCE(o.daily_revenue, 0),
                'profit', COALESCE(o.daily_profit, 0)
            ) ORDER BY d.day
        ) as daily_revenue
    FROM generate_series(start_date_ts::date, end_date_ts::date, '1 day'::interval) d(day)
    LEFT JOIN (
        SELECT
            created_at::date as order_date,
            SUM(total_price) as daily_revenue,
            SUM(profit) as daily_profit
        FROM public.orders
        WHERE created_at >= start_date_ts AND created_at <= end_date_ts
        GROUP BY order_date
    ) o ON d.day::date = o.order_date
),
order_status_data AS (
    SELECT
        json_agg(
            json_build_object(
                'status', status,
                'count', count
            )
        ) as order_status_counts
    FROM (
        SELECT
            status,
            COUNT(*) as count
        FROM public.orders
        WHERE created_at >= start_date_ts AND created_at <= end_date_ts
        GROUP BY status
    ) s
),
top_blends_data AS (
    SELECT
        json_agg(
            json_build_object(
                'blend_name', blend_name,
                'profit', total_profit
            )
        ) as top_profitable_blends
    FROM (
        SELECT
            blend_name,
            SUM(profit) as total_profit
        FROM public.orders
        WHERE created_at >= start_date_ts AND created_at <= end_date_ts AND profit IS NOT NULL
        GROUP BY blend_name
        ORDER BY total_profit DESC
        LIMIT 5
    ) t
),
customer_type_data AS (
    SELECT
        json_build_object(
            'new', COALESCE(SUM(CASE WHEN cl.phone_number IS NULL AND cir.order_count = 1 THEN 1 ELSE 0 END), 0),
            'returning', COALESCE(SUM(CASE WHEN cl.phone_number IS NULL AND cir.order_count > 1 THEN 1 ELSE 0 END), 0),
            'loyal', COALESCE(SUM(CASE WHEN cl.phone_number IS NOT NULL THEN 1 ELSE 0 END), 0)
        ) as customer_types
    FROM (
        SELECT
            customer_phone,
            COUNT(*) as order_count
        FROM public.orders
        WHERE created_at >= start_date_ts AND created_at <= end_date_ts
        GROUP BY customer_phone
    ) cir
    LEFT JOIN public.customer_loyalty cl ON cir.customer_phone = cl.phone_number
)
SELECT
    json_build_object(
        'daily_revenue', (SELECT daily_revenue FROM daily_revenue_data),
        'order_status_counts', (SELECT order_status_counts FROM order_status_data),
        'top_profitable_blends', (SELECT top_profitable_blends FROM top_blends_data),
        'customer_types', (SELECT customer_types FROM customer_type_data)
    );
$$;


ALTER FUNCTION public.get_dashboard_charts_data(start_date_ts timestamp with time zone, end_date_ts timestamp with time zone) OWNER TO postgres;

--

CREATE FUNCTION public.get_dashboard_summary(start_date date, end_date date) RETURNS TABLE("totalRevenue" numeric, "totalCogs" numeric, "totalOrders" bigint, "totalExpenses" numeric, "grossProfit" numeric, "netProfit" numeric)
    LANGUAGE sql
    AS $$
    WITH order_summary AS (
        SELECT
            COALESCE(SUM(total_price), 0) as total_revenue,
            COALESCE(SUM(order_cost), 0) as total_cogs,
            COUNT(*) as total_orders
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date + interval '1 day'
    ),
    expense_summary AS (
        SELECT
            COALESCE(SUM(amount), 0) as total_expenses
        FROM public.transactions
        WHERE 
            type = 'expense' AND
            date >= start_date AND 
            date <= end_date
    )
    SELECT
        os.total_revenue,
        os.total_cogs,
        os.total_orders,
        es.total_expenses,
        (os.total_revenue - os.total_cogs) as gross_profit,
        (os.total_revenue - os.total_cogs - es.total_expenses) as net_profit
    FROM order_summary os, expense_summary es;
$$;


ALTER FUNCTION public.get_dashboard_summary(start_date date, end_date date) OWNER TO postgres;

--

CREATE FUNCTION public.get_dashboard_summary(start_date_ts timestamp with time zone, end_date_ts timestamp with time zone) RETURNS TABLE("totalRevenue" numeric, "totalCogs" numeric, "totalOrders" bigint, "totalExpenses" numeric, "grossProfit" numeric, "netProfit" numeric)
    LANGUAGE sql
    AS $$
    WITH order_summary AS (
        SELECT
            COALESCE(SUM(total_price), 0) as total_revenue,
            COALESCE(SUM(order_cost), 0) as total_cogs,
            COUNT(*) as total_orders
        FROM public.orders
        WHERE created_at >= start_date_ts AND created_at <= end_date_ts
    ),
    expense_summary AS (
        SELECT
            COALESCE(SUM(amount), 0) as total_expenses
        FROM public.transactions
        WHERE 
            type = 'expense' AND
            date >= start_date_ts::date AND 
            date <= end_date_ts::date
    )
    SELECT
        os.total_revenue,
        os.total_cogs,
        os.total_orders,
        es.total_expenses,
        (os.total_revenue - os.total_cogs) as gross_profit,
        (os.total_revenue - os.total_cogs - es.total_expenses) as net_profit
    FROM order_summary os, expense_summary es;
$$;


ALTER FUNCTION public.get_dashboard_summary(start_date_ts timestamp with time zone, end_date_ts timestamp with time zone) OWNER TO postgres;

--

CREATE FUNCTION public.get_user_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  user_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$;


ALTER FUNCTION public.get_user_role() OWNER TO postgres;

--

CREATE FUNCTION public.handle_new_order_transaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.transactions (date, type, amount, description, related_order_id)
  VALUES (
    NEW.created_at::date,
    'income',
    NEW.total_price,
    'إيراد من طلب العميل: ' || NEW.customer_name,
    NEW.id
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_order_transaction() OWNER TO postgres;

--

CREATE FUNCTION public.handle_new_purchase_transaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT id INTO v_category_id FROM public.expense_categories WHERE name_ar = 'مشتريات مواد خام' LIMIT 1;
  INSERT INTO public.transactions (date, type, category_id, amount, description, related_purchase_id)
  VALUES (
    NEW.created_at::date,
    'expense',
    v_category_id,
    NEW.cost,
    'شراء ' || NEW.item_type || ' بكود ' || NEW.item_code,
    NEW.id
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_purchase_transaction() OWNER TO postgres;

--

CREATE FUNCTION public.handle_new_salary_payment_transaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_category_id UUID;
  v_employee_name TEXT;
BEGIN
  -- الحصول على معرّف فئة "مرتبات"
  SELECT id INTO v_category_id FROM public.expense_categories WHERE name_ar = 'مرتبات' LIMIT 1;
  -- الحصول على اسم الموظف
  SELECT employee_name INTO v_employee_name FROM public.salaries WHERE id = NEW.salary_id;
  
  -- إدراج معاملة مصروف جديدة
  INSERT INTO public.transactions (date, type, category_id, amount, description)
  VALUES (
    NEW.payment_date,
    'expense',
    v_category_id,
    NEW.amount_paid,
    'راتب الموظف: ' || v_employee_name
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_salary_payment_transaction() OWNER TO postgres;

--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if this is the first user being created
  IF (SELECT count(*) FROM auth.users) = 1 THEN
    v_role := 'admin';
  ELSE
    v_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, phone_number, address)
  VALUES (
    new.id, 
    v_role, -- Use the determined role
    new.raw_user_meta_data ->> 'full_name', 
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'address'
  );
  RETURN new;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--

CREATE FUNCTION public.handle_order_loyalty_points() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION public.handle_order_loyalty_points() OWNER TO postgres;

--

CREATE FUNCTION public.process_roast_session(p_coffee_code text, p_green_kg_in numeric, p_roast_level text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
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


ALTER FUNCTION public.process_roast_session(p_coffee_code text, p_green_kg_in numeric, p_roast_level text) OWNER TO postgres;

--

CREATE FUNCTION public.update_order_profit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.order_cost IS NOT NULL AND NEW.total_price IS NOT NULL THEN
    NEW.profit := NEW.total_price - NEW.order_cost;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_order_profit() OWNER TO postgres;

--

CREATE VIEW public.blend_ratings AS
 SELECT blend_code,
    count(*) AS review_count,
    avg(rating) AS average_rating
   FROM public.reviews
  GROUP BY blend_code;


ALTER VIEW public.blend_ratings OWNER TO postgres;

--

CREATE VIEW public.blends_with_ratings AS
 SELECT b.code,
    b.name_ar,
    b.name_en,
    b.notes_ar,
    b.notes_en,
    b.preparation_notes_ar,
    b.preparation_notes_en,
    b.method_id,
    b.sensory_profile,
    b.is_active,
    b.manual_price,
    b.display_category,
    b.available_additive_ids,
    COALESCE(br.review_count, (0)::bigint) AS review_count,
    br.average_rating,
    ( SELECT json_agg(json_build_object('percentage', bc.percentage, 'coffee_type_code', bc.coffee_type_code, 'coffee_types', json_build_object('name_ar', ct.name_ar, 'name_en', ct.name_en))) AS json_agg
           FROM (public.blend_compositions bc
             JOIN public.coffee_types ct ON ((bc.coffee_type_code = ct.code)))
          WHERE (bc.blend_code = b.code)) AS blend_compositions
   FROM (public.blends b
     LEFT JOIN public.blend_ratings br ON ((b.code = br.blend_code)));


ALTER VIEW public.blends_with_ratings OWNER TO postgres;

--

CREATE TRIGGER on_order_cost_update BEFORE UPDATE OF order_cost ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_order_profit();


--

CREATE TRIGGER on_order_created_calculate_cost BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.calculate_order_cost_and_profit();


--

CREATE TRIGGER on_order_created_create_transaction AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_new_order_transaction();


--

CREATE TRIGGER on_order_created_update_loyalty AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_order_loyalty_points();


--

CREATE TRIGGER on_purchase_created_create_transaction AFTER INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.handle_new_purchase_transaction();


--

CREATE TRIGGER on_salary_payment_create_transaction AFTER INSERT ON public.salary_payments FOR EACH ROW EXECUTE FUNCTION public.handle_new_salary_payment_transaction();


--

ALTER TABLE public.additives ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.banned_phones ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.blend_compositions ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.blends ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.coffee_types ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.loyalty_log ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.method_status ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.roastery_payouts ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.roasting_sessions ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

--

CREATE POLICY "Allow admin to manage additives" ON public.additives USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Allow public read access to additives" ON public.additives FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage banned phones" ON public.banned_phones USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage blend compositions" ON public.blend_compositions USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Blend compositions are viewable by everyone" ON public.blend_compositions FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage blends" ON public.blends USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can view active blends" ON public.blends FOR SELECT USING ((is_active = true));


--

CREATE POLICY "Users can delete their own cart items." ON public.carts FOR DELETE USING ((auth.uid() = user_id));


--

CREATE POLICY "Users can insert their own cart items." ON public.carts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--

CREATE POLICY "Users can update their own cart items." ON public.carts FOR UPDATE USING ((auth.uid() = user_id));


--

CREATE POLICY "Users can view their own cart items." ON public.carts FOR SELECT USING ((auth.uid() = user_id));


--

CREATE POLICY "Public can view coffee types" ON public.coffee_types FOR SELECT USING (true);


--

CREATE POLICY "Admins can view loyalty points" ON public.customer_loyalty FOR SELECT USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage discount codes" ON public.discount_codes USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can view active discount codes" ON public.discount_codes FOR SELECT USING (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now()))));


--

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage fixed expenses" ON public.fixed_expenses TO authenticated USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage loyalty logs" ON public.loyalty_log USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage method statuses" ON public.method_status USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can view method statuses" ON public.method_status FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage notification templates" ON public.notification_templates USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Allow public read access to templates" ON public.notification_templates FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage all orders" ON public.orders USING (true) WITH CHECK (true);


--

CREATE POLICY "Admins can manage all profiles." ON public.profiles USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);


--

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--

CREATE POLICY "Admins can manage all purchases" ON public.purchases USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Allow admins full access" ON public.push_subscriptions USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Allow users to manage their own subscriptions" ON public.push_subscriptions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--

CREATE POLICY "Public can read all reviews" ON public.reviews FOR SELECT USING (true);


--

CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--

CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--

CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--

CREATE POLICY "Admins and roasters can insert roastery_payouts" ON public.roastery_payouts FOR INSERT TO authenticated WITH CHECK ((public.get_user_role() = ANY (ARRAY['admin'::text, 'roaster'::text])));


--

CREATE POLICY "Admins and roasters can view roastery_payouts" ON public.roastery_payouts FOR SELECT USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'roaster'::text])));


--

CREATE POLICY "Admins can manage roasting sessions" ON public.roasting_sessions USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Roasters can view and create their own sessions" ON public.roasting_sessions USING (((public.get_user_role() = 'roaster'::text) AND (roasted_by = auth.uid())));


--

CREATE POLICY "Admins can manage salaries" ON public.salaries TO authenticated USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage salary payments" ON public.salary_payments TO authenticated USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage site content" ON public.site_content USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can read site content" ON public.site_content FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage settings" ON public.store_settings USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can view settings" ON public.store_settings FOR SELECT USING (true);


--

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Public can view active subscription plans" ON public.subscription_plans FOR SELECT USING ((is_active = true));


--

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions USING ((auth.uid() = user_id));


--

CREATE POLICY "Admins can manage suppliers" ON public.suppliers TO authenticated USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Admins can manage transactions" ON public.transactions USING ((public.get_user_role() = 'admin'::text));


--

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--

CREATE POLICY "Users can view their own wishlist items" ON public.wishlist FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.orders;


--

-- Auth trigger required for profile creation on signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
