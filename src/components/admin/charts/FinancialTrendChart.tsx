import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order } from '@/types/supabase';
import { format, eachDayOfInterval, parseISO, startOfDay } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface FinancialTrendChartProps {
    orders: Order[];
    dateRange: DateRange;
}

const FinancialTrendChart = ({ orders, dateRange }: FinancialTrendChartProps) => {
    const chartData = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return [];

        const days = eachDayOfInterval({
            start: startOfDay(dateRange.from),
            end: startOfDay(dateRange.to),
        });

        const dailyData = new Map<string, { revenue: number; cost: number; profit: number }>();
        days.forEach(day => {
            dailyData.set(format(day, 'yyyy-MM-dd'), { revenue: 0, cost: 0, profit: 0 });
        });

        orders.forEach(order => {
            const orderDate = format(parseISO(order.created_at), 'yyyy-MM-dd');
            if (dailyData.has(orderDate)) {
                const dayData = dailyData.get(orderDate)!;
                dayData.revenue += order.total_price || 0;
                dayData.cost += order.order_cost || 0;
                dayData.profit += order.profit || 0;
            }
        });

        return Array.from(dailyData.entries()).map(([date, data]) => ({
            date: format(parseISO(date), 'MMM d', { locale: arSA }),
            'الإيرادات': data.revenue,
            'التكاليف': data.cost,
            'الأرباح': data.profit,
        }));
    }, [orders, dateRange]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ج.م`} />
                <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(0)} جنيه`, name]} />
                <Legend />
                <Line type="monotone" dataKey="الإيرادات" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="التكاليف" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="الأرباح" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default FinancialTrendChart;