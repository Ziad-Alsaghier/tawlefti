import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order } from '@/types/supabase';
import { subDays, format, eachDayOfInterval, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface RevenueChartProps {
    orders: Order[];
}

const RevenueChart = ({ orders }: RevenueChartProps) => {
    const revenueData = useMemo(() => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date(),
        });

        const dailyRevenue = new Map<string, number>();
        last30Days.forEach(day => {
            dailyRevenue.set(format(day, 'yyyy-MM-dd'), 0);
        });

        orders.forEach(order => {
            const orderDate = format(parseISO(order.created_at), 'yyyy-MM-dd');
            if (dailyRevenue.has(orderDate)) {
                dailyRevenue.set(orderDate, (dailyRevenue.get(orderDate) || 0) + (order.total_price || 0));
            }
        });

        return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
            date: format(parseISO(date), 'MMM d', { locale: arSA }),
            revenue,
        }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ج.م`} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} جنيه`, 'الإيراد']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RevenueChart;