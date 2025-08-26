import { supabase } from '@/integrations/supabase/client';
import { CoffeeType } from '@/types/supabase';

export const fetchActiveCoffeeTypes = async (): Promise<Pick<CoffeeType, 'code' | 'name_ar'>[]> => {
    const { data, error } = await supabase.from('coffee_types').select('code, name_ar').eq('is_active', true).order('name_ar');
    if (error) throw error;
    return data;
};

export const fetchCoffeePrices = async (composition: any[]): Promise<Record<string, any>> => {
    const coffeeTypeCodes = composition.map(c => c.coffee_type_code).filter(Boolean);
    if (coffeeTypeCodes.length === 0) return {};
    
    const { data, error } = await supabase
        .from('coffee_types')
        .select('*')
        .in('code', coffeeTypeCodes);
    
    if (error) throw new Error(error.message);

    return data.reduce((acc, coffee) => {
        acc[coffee.code] = coffee;
        return acc;
    }, {} as Record<string, any>);
};

export const fetchAvailableGreenCoffee = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase
        .from('coffee_types')
        .select('*')
        .gt('stock_green_kg', 0)
        .eq('is_active', true)
        .order('name_ar');
    if (error) throw error;
    return data;
};

export const fetchCoffeeTypes = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase.from('coffee_types').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

export const fetchCoffeeInventory = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase.from('coffee_types').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};