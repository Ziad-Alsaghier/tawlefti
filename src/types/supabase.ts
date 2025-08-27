// This file contains type definitions for your Supabase database tables.
// It helps ensure type safety when working with data from Supabase.

export interface Profile {
    id: string;
    role: 'admin' | 'user' | 'roaster' | null;
    full_name: string | null;
    phone_number: string | null;
    admin_notes: string | null;
    address: string | null;
}

export interface CoffeeType {
    code: string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
    price_green_kg: number | null;
    price_light_kg: number | null;
    price_medium_kg: number | null;
    price_dark_kg: number | null;
    stock_green_kg: number | null;
    stock_light_kg: number | null;
    stock_medium_kg: number | null;
    stock_dark_kg: number | null;
}

export interface MethodStatus {
    method_id: string;
    is_active: boolean;
    profit_margin: number | null;
}

export interface Additive {
    id: string;
    name_ar: string;
    name_en: string;
    price_per_250g: number;
    cost_per_250g: number;
    is_active: boolean;
    created_at?: string;
    stock_grams: number | null;
}

export interface BlendComposition {
    blend_code: string;
    coffee_type_code: string;
    percentage: number;
    coffee_types?: Pick<CoffeeType, 'name_ar' | 'name_en'>; // For fetching composition with names
}

export interface Blend {
    code: string;
    name_ar: string;
    name_en: string;
    notes_ar: string | null;
    notes_en: string | null;
    preparation_notes_ar: string | null;
    preparation_notes_en: string | null;
    method_id: string | null;
    sensory_profile: Record<string, number> | null;
    is_active: boolean;
    blend_compositions?: BlendComposition[]; 
    manual_price: number | null;
    display_category: string | null;
    available_additive_ids: string[] | null;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  blend_name: string;
  blend_code: string | null;
  roast_level: string | null;
  weight_grams: number | null;
  additives: string[] | null;
  total_price: number | null;
  status: OrderStatus;
  order_cost: number | null;
  profit: number | null;
  discount_code: string | null;
  discount_amount: number | null;
  points_earned: number | null;
  points_redeemed: number | null;
  user_id: string | null;
  cancel_reason: string | null;
  delivery_slot: string | null;
}

export interface Purchase {
    id: number;
    created_at: string;
    item_type: 'coffee' | 'additive';
    item_code: string;
    quantity: number;
    cost: number;
    supplier: string | null;
    notes: string | null;
    supplier_id: string | null; // New field
    suppliers?: { name: string } | null; // For joins
}

export interface DiscountCode {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    expires_at: string | null;
    usage_limit: number | null;
    usage_count: number;
    is_active: boolean;
    created_at: string;
}

export interface BannedPhone {
    phone_number: string;
    reason: string | null;
    banned_at: string;
}

export interface CustomerLoyalty {
    phone_number: string;
    points: number;
    updated_at: string;
}

export interface Cart {
    id: string;
    user_id: string;
    blend_code: string;
    blend_name_ar: string;
    roast: string;
    weight: number;
    additives: { id: string; name_ar: string; price_per_250g: number }[] | null;
    quantity: number;
    unit_price: number;
    created_at: string;
}

export interface RoastingSession {
    id: string;
    created_at: string;
    coffee_type_code: string;
    roast_level: 'light' | 'medium' | 'dark';
    green_kg_in: number;
    roasted_kg_out: number;
    roasted_by: string | null;
}

export interface RoasteryPayout { // New interface for roastery_payouts table
    id: string;
    order_id: string;
    payout_amount: number;
    payout_date: string;
    recorded_by: string | null;
    created_at: string;
}

export interface ExpenseCategory {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string | null;
    description_en: string | null;
    created_at: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category_id: string | null;
    amount: number;
    description: string;
    related_order_id: string | null;
    related_purchase_id: number | null;
    created_at: string;
    expense_categories?: Pick<ExpenseCategory, 'name_ar'> | null;
}

export interface StoreSetting {
    key: 'operating_hours' | 'delivery_slots';
    value: any;
    description?: string;
    updated_at: string;
}

export interface Supplier {
    id: string;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    created_at: string;
}

export interface FixedExpense {
    id: string;
    name: string;
    amount: number;
    category_id: string | null;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    is_active: boolean;
    created_at: string;
    expense_categories?: { name_ar: string } | null;
}

// New Payroll Types
export interface Salary {
    id: string;
    employee_name: string;
    salary_amount: number;
    is_active: boolean;
    created_at: string;
}

export interface SalaryPayment {
    id: string;
    salary_id: string;
    payment_date: string;
    amount_paid: number;
    notes: string | null;
    created_at: string;
    salaries?: Pick<Salary, 'employee_name'>;
}