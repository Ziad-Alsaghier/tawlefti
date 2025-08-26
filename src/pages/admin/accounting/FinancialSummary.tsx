import { useQuery } from '@tanstack/react-query';
import { Order, Transaction } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { fetchOrdersByDateRange } from '@/queries/orders';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const fetchOperatingExpenses = async (dateRange?: DateRange): Promise<Pick<Transaction, 'amount'>[]> => {
    let query = supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense')
        .is('related_purchase_id', null); // Only operating expenses, not purchases

    if (dateRange?.from) {
        query = query.gte('date', dateRange.from.toISOString().split('T')[0]);
    }
    if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        query = query.lte('date', toDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data || [];
};


const FinancialSummary = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
        queryKey: ['ordersForSummary', date],
        queryFn: () => fetchOrdersByDateRange(date),
    });

    const { data: operatingExpenses, isLoading: isLoadingExpenses } = useQuery<Pick<Transaction, 'amount'>[]>({
        queryKey: ['operatingExpensesForSummary', date],
        queryFn: () => fetchOperatingExpenses(date),
    });

    const financialData = useMemo(() => {
        if (!orders || !operatingExpenses) return null;

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const cogs = orders.reduce((sum, order) => sum + (order.order_cost || 0), 0);
        const grossProfit = totalRevenue - cogs;
        const totalOperatingExpenses = operatingExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = grossProfit - totalOperatingExpenses;

        return { totalRevenue, cogs, grossProfit, totalOperatingExpenses, netProfit };
    }, [orders, operatingExpenses]);

    const isLoading = isLoadingOrders || isLoadingExpenses;

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-right">
                    <h1 className="text-3xl font-bold">الملخص المالي (بيان الأرباح والخسائر)</h1>
                    <p className="text-muted-foreground mt-2">نظرة شاملة على صافي ربحية مشروعك خلال فترة محددة.</p>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
            ) : financialData ? (
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>بيان الأرباح والخسائر</CardTitle>
                        <CardDescription>
                            الفترة من {date?.from?.toLocaleDateString('ar-EG')} إلى {date?.to?.toLocaleDateString('ar-EG')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                            <span className="font-medium">إجمالي الإيرادات (المبيعات)</span>
                            <span className="font-bold text-green-600">{formatCurrency(financialData.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                            <span className="font-medium text-red-600">(-) تكلفة البضاعة المباعة (COGS)</span>
                            <span className="font-bold text-red-600">{formatCurrency(financialData.cogs)}</span>
                        </div>
                        
                        <Separator />

                        <div className="flex justify-between items-center p-3 rounded-md bg-primary/10">
                            <span className="font-semibold text-primary">= إجمالي الربح</span>
                            <span className="font-extrabold text-xl text-primary">{formatCurrency(financialData.grossProfit)}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                            <span className="font-medium text-red-600">(-) المصروفات التشغيلية</span>
                            <span className="font-bold text-red-600">{formatCurrency(financialData.totalOperatingExpenses)}</span>
                        </div>

                        <Separator className="my-6 border-2 border-dashed" />

                        <div className={cn(
                            "flex justify-between items-center p-4 rounded-lg text-2xl",
                            financialData.netProfit >= 0 ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                        )}>
                            <span className="font-extrabold flex items-center gap-2">
                                {financialData.netProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
                                صافي الربح / الخسارة
                            </span>
                            <span className="font-extrabold">{formatCurrency(financialData.netProfit)}</span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <p className="text-center text-muted-foreground">لا توجد بيانات لعرضها.</p>
            )}
        </div>
    );
};

export default FinancialSummary;