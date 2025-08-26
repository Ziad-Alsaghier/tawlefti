import { supabase } from '@/integrations/supabase/client';

export const fetchSiteContent = async () => {
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (error) throw error;
    const content: Record<string, any> = {};
    if (data) {
        data.forEach(item => {
            content[item.key] = item.value;
        });
    }
    return content;
};