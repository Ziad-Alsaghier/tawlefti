import { supabase } from '@/integrations/supabase/client';

export const fetchStoreSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('key, value');
    if (error) throw error;
    const settings: Record<string, any> = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
};