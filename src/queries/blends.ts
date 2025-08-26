import { supabase } from '@/integrations/supabase/client';
import { Blend } from '@/types/supabase';

export const fetchBlendsByMethod = async (methodIds: string[]): Promise<Blend[]> => {
    if (methodIds.length === 0) return [];
    const { data, error } = await supabase
        .from('blends')
        .select('*, blend_compositions(*, coffee_types(name_ar, name_en))')
        .in('method_id', methodIds);
    
    if (error) {
        throw new Error(error.message);
    }
    return data || [];
};

export const fetchBlends = async (): Promise<Blend[]> => {
    const { data, error } = await supabase
        .from('blends')
        .select('*, blend_compositions(*, coffee_types(name_ar))')
        .order('name_ar');
    if (error) throw new Error(error.message);
    return data as any;
};

export const fetchBlendComposition = async (blendCode: string) => {
    const { data, error } = await supabase.from('blend_compositions').select('coffee_type_code, percentage').eq('blend_code', blendCode);
    if (error) throw error;
    return data;
};

export interface BlendDataForCard {
    method_id: string | null;
    blend_compositions: {
        percentage: number;
        coffee_types: {
            name_ar: string;
        } | null;
    }[];
}

export const fetchBlendDataForCard = async (blendCode: string | null): Promise<BlendDataForCard | null> => {
    if (!blendCode) return null;
    const { data, error } = await supabase
        .from('blends')
        .select('method_id, blend_compositions(percentage, coffee_types(name_ar))')
        .eq('code', blendCode)
        .single();
    if (error) {
        console.error('Error fetching blend data for live card:', error);
        return null;
    }
    return data as BlendDataForCard;
};

export const fetchFunctionalBlends = async (): Promise<Blend[]> => {
    const { data, error } = await supabase
        .from('blends')
        .select('*')
        .eq('display_category', 'وظيفية')
        .eq('is_active', true);
    
    if (error) {
        throw new Error(error.message);
    }
    return data || [];
};

export const fetchBlendByCode = async (blendCode: string): Promise<Blend | null> => {
    const { data, error } = await supabase
        .from('blends')
        .select('*, blend_compositions(*, coffee_types(name_ar, name_en))')
        .eq('code', blendCode)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw new Error(error.message);
    }
    return data;
};