import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Order } from '@/types/supabase';

interface TopBlendsChartProps {
    orders: Order[];
}

const TopBlendsChart = ({ orders }: TopBlendsChartProps) => {
    const topBlendsData = useMemo(() => {
        const blendCounts = orders.reduce((acc, order) => {
            acc[order.blend_name] = (acc[order.blend_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(blendCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topBlendsData} layout="vertical" margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tick={{ textAnchor: 'end' }} />
                <Tooltip formatter={(value: number) => [`${value} طلب`, 'عدد الطلبات']} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopBlendsChart;