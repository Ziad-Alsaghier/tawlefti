import { supabase } from '@/integrations/supabase/client';
import { MethodStatus, Profile, Purchase, RoastingSession, DiscountCode, ExpenseCategory, Transaction } from '@/types/supabase';
import { DateRange } from 'react-day-picker';

export const fetchMethodStatuses = async (): Promise<MethodStatus[]> => {
    const { data, error } = await supabase.from('method_status').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const fetchProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const fetchPurchases = async (): Promise<Purchase[]> => {
    const { data, error } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export interface RoastingSessionWithDetails extends RoastingSession {
    coffee_types: { name_ar: string } | null;
    profiles: { full_name: string | null } | null;
}

export const fetchRoastingSessions = async (): Promise<RoastingSessionWithDetails[]> => {
    const { data, error } = await supabase
        .from('roasting_sessions')
        .select(`*, coffee_types(name_ar), profiles(full_name)`)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as RoastingSessionWithDetails[];
};

export const fetchDiscounts = async (): Promise<DiscountCode[]> => {
    const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase.from('expense_categories').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

interface TransactionWithCategory extends Transaction {
    expense_categories: { name_ar: string } | null;
}

export const fetchManualExpenses = async (): Promise<TransactionWithCategory[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, expense_categories(name_ar)')
        .eq('type', 'expense')
        .is('related_purchase_id', null) // Fetch only manual expenses
        .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
};

export const fetchAllTransactions = async (): Promise<TransactionWithCategory[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, expense_categories(name_ar)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
};

export const fetchExpensesByDateRange = async (dateRange?: DateRange): Promise<Pick<Transaction, 'amount'>[]> => {
    let query = supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense');

    if (dateRange?.from) {
        query = query.gte('date', dateRange.from.toISOString().split('T')[0]);
    }
    if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        query = query.lte('date', toDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data || [];
};