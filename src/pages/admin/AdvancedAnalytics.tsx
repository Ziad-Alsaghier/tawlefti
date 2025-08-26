import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, CustomerLoyalty } from '@/types/supabase';
import { Loader2 } from 'lucide-react';
import SalesByHourChart from '@/components/admin/charts/advanced/SalesByHourChart';
import SalesByDayChart from '@/components/admin/charts/advanced/SalesByDayChart';
import CustomerTypeChart from '@/components/admin/charts/advanced/CustomerTypeChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchAllOrdersForAnalytics = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('created_at, customer_phone');
    if (error) throw new Error(error.message);
    return data as Order[];
};

const fetchAllLoyaltyData = async (): Promise<CustomerLoyalty[]> => {
    const { data, error } = await supabase.from('customer_loyalty').select('phone_number');
    if (error) throw new Error(error.message);
    return data;
};

const AdvancedAnalytics = () => {
    const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
        queryKey: ['allOrdersForAnalytics'],
        queryFn: fetchAllOrdersForAnalytics,
    });

    const { data: loyaltyData, isLoading: isLoadingLoyalty } = useQuery<CustomerLoyalty[]>({
        queryKey: ['allLoyaltyForAnalytics'],
        queryFn: fetchAllLoyaltyData,
    });

    const isLoading = isLoadingOrders || isLoadingLoyalty;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">التحليلات المتقدمة</h1>
                <p className="text-muted-foreground mt-2">نظرة عميقة على سلوك العملاء وأوقات الذروة للمبيعات.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
            ) : orders && loyaltyData ? (
                <div className="grid gap-8 md:grid-cols-2">
                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>المبيعات حسب ساعة اليوم</CardTitle></CardHeader>
                        <CardContent><SalesByHourChart orders={orders} /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>المبيعات حسب يوم الأسبوع</CardTitle></CardHeader>
                        <CardContent><SalesByDayChart orders={orders} /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>تحليل أنواع العملاء</CardTitle></CardHeader>
                        <CardContent><CustomerTypeChart orders={orders} loyaltyData={loyaltyData} /></CardContent>
                    </Card>
                </div>
            ) : (
                <p className="text-center text-destructive">فشل تحميل بيانات التحليلات.</p>
            )}
        </div>
    );
};

export default AdvancedAnalytics;