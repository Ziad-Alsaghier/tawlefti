import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Order } from '@/types/supabase';
import { parseISO, getHours } from 'date-fns';

interface SalesByHourChartProps {
    orders: Pick<Order, 'created_at'>[];
}

const SalesByHourChart = ({ orders }: SalesByHourChartProps) => {
    const data = useMemo(() => {
        const hourlySales = Array(24).fill(0).map((_, i) => ({ hour: `${i}:00`, sales: 0 }));
        orders.forEach(order => {
            const hour = getHours(parseISO(order.created_at));
            hourlySales[hour].sales += 1;
        });
        return hourlySales;
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip formatter={(value: number) => [`${value} طلب`, 'عدد الطلبات']} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesByHourChart;