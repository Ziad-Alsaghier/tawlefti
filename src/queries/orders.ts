import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/supabase';
import { DateRange } from "react-day-picker";

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Order[];
};

export const fetchLiveOrders = async (): Promise<Order[]> => {
    const statuses: OrderStatus[] = ['pending', 'processing', 'shipped'];
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', statuses)
        .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
};

export const fetchRecentOrders = async (twentyFourHoursAgo: string): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['completed', 'cancelled'])
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchOrdersByDateRange = async (dateRange?: DateRange): Promise<Order[]> => {
    let query = supabase.from('orders').select('*');

    if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the whole 'to' day
        query = query.lte('created_at', toDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

export const fetchAllOrdersForStats = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw new Error(error.message);
    return data as Order[];
};

export const fetchAllOrdersForCharts = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('created_at, total_price, status, blend_name, profit');
    if (error) throw new Error(error.message);
    return data as Order[];
};

export const fetchAllOrdersForCustomers = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};