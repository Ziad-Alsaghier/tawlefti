import { Order, CustomerLoyalty } from '@/types/supabase';
import { Loader2 } from 'lucide-react';
import RevenueChart from './charts/RevenueChart';
import OrderStatusChart from './charts/OrderStatusChart';
import TopProfitableBlendsChart from './charts/TopProfitableBlendsChart';
import CustomerTypeChart from './charts/advanced/CustomerTypeChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardChartsProps {
    orders: Order[] | undefined;
    loyaltyData: Pick<CustomerLoyalty, 'phone_number'>[] | undefined;
    isLoading: boolean;
}

const DashboardCharts = ({ orders, loyaltyData, isLoading }: DashboardChartsProps) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="lg:col-span-2">
                        <CardHeader><CardTitle>جاري التحميل...</CardTitle></CardHeader>
                        <CardContent className="flex justify-center items-center h-[350px]">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!orders || !loyaltyData) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>الإيرادات (آخر 30 يومًا)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <RevenueChart orders={orders} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>حالة الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderStatusChart orders={orders} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>تحليل أنواع العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerTypeChart orders={orders} loyaltyData={loyaltyData} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>أكثر 5 توليفات ربحية</CardTitle>
                </CardHeader>
                <CardContent>
                    <TopProfitableBlendsChart orders={orders} />
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardCharts;