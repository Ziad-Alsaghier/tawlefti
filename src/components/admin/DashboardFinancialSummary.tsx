import { Order, Transaction } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Scale, Receipt, Percent, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

interface DashboardFinancialSummaryProps {
    orders: Order[] | undefined;
    expenses: Pick<Transaction, 'amount'>[] | undefined;
    isLoading: boolean;
}

const DashboardFinancialSummary = ({ orders, expenses, isLoading }: DashboardFinancialSummaryProps) => {
    const stats = useMemo(() => {
        if (!orders || !expenses) return {
            totalRevenue: 0,
            totalCogs: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
        };

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const totalCogs = orders.reduce((sum, order) => sum + (order.order_cost || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalRevenue - totalCogs - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalCogs, totalExpenses, netProfit, profitMargin };
    }, [orders, expenses]);

    const formatCurrency = (amount: number) => `${amount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م`;

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">جاري التحميل...</CardTitle>
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي التكاليف (COGS)</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalCogs)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المصروفات التشغيلية</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.netProfit)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">هامش الربح الصافي</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardFinancialSummary;