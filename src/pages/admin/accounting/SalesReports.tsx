import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, DollarSign, TrendingUp, Scale, BarChart, ShoppingCart, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import FinancialTrendChart from '@/components/admin/charts/FinancialTrendChart';
import TopRevenueBlendsChart from '@/components/admin/charts/TopRevenueBlendsChart';
import TopCustomersChart from '@/components/admin/charts/TopCustomersChart';

const fetchOrdersByDateRange = async (dateRange?: DateRange): Promise<Order[]> => {
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

const FinancialStatsCards = ({ orders }: { orders: Order[] | undefined }) => {
    const stats = useMemo(() => {
        if (!orders) return { totalRevenue: 0, totalCost: 0, totalProfit: 0, profitMargin: 0, totalOrders: 0, averageOrderValue: 0 };

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const totalCost = orders.reduce((sum, order) => sum + (order.order_cost || 0), 0);
        const totalProfit = orders.reduce((sum, order) => sum + (order.profit || 0), 0);
        const totalOrders = orders.length;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return { totalRevenue, totalCost, totalProfit, profitMargin, totalOrders, averageOrderValue };
    }, [orders]);

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ج.م</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي التكاليف</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">صافي الأرباح</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</div>
                </CardContent>
            </Card>
        </div>
    );
};

const SalesReports = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const { data: orders, isLoading, error } = useQuery<Order[]>({
        queryKey: ['salesReportOrders', date],
        queryFn: () => fetchOrdersByDateRange(date),
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-right">
                    <h1 className="text-3xl font-bold">تقارير المبيعات والأداء</h1>
                    <p className="text-muted-foreground mt-2">تحليل شامل للإيرادات، التكاليف، والأرباح.</p>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <p className="text-destructive text-center p-8">{(error as Error).message}</p>
            ) : (
                <>
                    <FinancialStatsCards orders={orders} />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>التوجه المالي خلال الفترة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {date && <FinancialTrendChart orders={orders || []} dateRange={date} />}
                        </CardContent>
                    </Card>

                    <div className="grid gap-8 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>أكثر التوليفات مبيعًا (حسب الإيراد)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TopRevenueBlendsChart orders={orders || []} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>أفضل العملاء (حسب الإنفاق)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TopCustomersChart orders={orders || []} />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>تفاصيل الطلبات المالية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الطلب</TableHead>
                                        <TableHead>العميل</TableHead>
                                        <TableHead className="text-green-600">الإيراد</TableHead>
                                        <TableHead className="text-red-600">التكلفة</TableHead>
                                        <TableHead className="text-blue-600">الربح</TableHead>
                                        <TableHead>تاريخ الطلب</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders && orders.length > 0 ? (
                                        orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                                                <TableCell>{order.customer_name}</TableCell>
                                                <TableCell className="font-medium text-green-600">{order.total_price?.toFixed(2)}</TableCell>
                                                <TableCell className="font-medium text-red-600">{order.order_cost?.toFixed(2)}</TableCell>
                                                <TableCell className="font-bold text-blue-600">{order.profit?.toFixed(2)}</TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                لا توجد طلبات في هذا النطاق الزمني.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default SalesReports;