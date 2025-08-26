import { supabase } from '@/integrations/supabase/client';
import { Additive } from '@/types/supabase';

export const fetchActiveAdditives = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('*').eq('is_active', true);
    if (error) throw new Error(error.message);
    return data || [];
};

export const fetchAdditives = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

export const fetchAdditiveInventory = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('id, name_ar, stock_grams').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};