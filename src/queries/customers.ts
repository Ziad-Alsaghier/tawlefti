import { supabase } from '@/integrations/supabase/client';
import { CustomerLoyalty, Order, Profile } from '@/types/supabase';

export const fetchCustomerData = async (phone: string) => {
    const ordersPromise = supabase.from('orders').select('*').eq('customer_phone', phone).order('created_at', { ascending: false });
    const banStatusPromise = supabase.from('banned_phones').select('*').eq('phone_number', phone).maybeSingle();
    const loyaltyPromise = supabase.from('customer_loyalty').select('*').eq('phone_number', phone).maybeSingle();
    const profilePromise = supabase.from('profiles').select('*').eq('phone_number', phone).maybeSingle();
    
    const [
        { data: orders, error: ordersError }, 
        { data: banStatus, error: banError },
        { data: loyalty, error: loyaltyError },
        { data: profile, error: profileError }
    ] = await Promise.all([ordersPromise, banStatusPromise, loyaltyPromise, profilePromise]);

    if (ordersError) throw ordersError;
    if (banError) throw banError;
    if (loyaltyError) throw loyaltyError;
    if (profileError) throw profileError;

    const blendsMap = new Map();
    if (orders && orders.length > 0) {
        const blendCodes = [...new Set(orders.map(o => o.blend_code).filter((c): c is string => !!c))];
        if (blendCodes.length > 0) {
            const { data: blends, error: blendsError } = await supabase
                .from('blends')
                .select('code, method_id')
                .in('code', blendCodes);
            
            if (blendsError) throw blendsError;

            if (blends) {
                for (const blend of blends) {
                    blendsMap.set(blend.code, blend);
                }
            }
        }
    }

    return { orders, banStatus, loyalty, blendsMap, profile: profile as Profile | null };
};

export const fetchAllLoyalty = async (): Promise<Pick<CustomerLoyalty, 'phone_number'>[]> => {
    const { data, error } = await supabase.from('customer_loyalty').select('phone_number');
    if (error) throw new Error(error.message);
    return data || [];
};