import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Order } from '@/types/supabase';

interface TopRevenueBlendsChartProps {
    orders: Order[];
}

const TopRevenueBlendsChart = ({ orders }: TopRevenueBlendsChartProps) => {
    const topBlendsData = useMemo(() => {
        const blendRevenues = orders.reduce((acc, order) => {
            acc[order.blend_name] = (acc[order.blend_name] || 0) + (order.total_price || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(blendRevenues)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, revenue]) => ({ name, 'الإيراد': revenue }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topBlendsData} layout="vertical" margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} tickFormatter={(value) => `${value} ج.م`} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tick={{ textAnchor: 'end' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} جنيه`, 'الإيراد']} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="الإيراد" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopRevenueBlendsChart;