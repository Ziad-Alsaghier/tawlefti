import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Order } from '@/types/supabase';

interface TopCustomersChartProps {
    orders: Order[];
}

const TopCustomersChart = ({ orders }: TopCustomersChartProps) => {
    const topCustomersData = useMemo(() => {
        const customerSpending = orders.reduce((acc, order) => {
            const customerIdentifier = order.customer_name || order.customer_phone;
            acc[customerIdentifier] = (acc[customerIdentifier] || 0) + (order.total_price || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(customerSpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, spending]) => ({ name, 'الإنفاق': spending }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topCustomersData} layout="vertical" margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} tickFormatter={(value) => `${value} ج.م`} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tick={{ textAnchor: 'end' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} جنيه`, 'إجمالي الإنفاق']} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="الإنفاق" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopCustomersChart;