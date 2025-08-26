import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Order } from '@/types/supabase';

interface TopProfitableBlendsChartProps {
    orders: Order[];
}

const TopProfitableBlendsChart = ({ orders }: TopProfitableBlendsChartProps) => {
    const topBlendsData = useMemo(() => {
        const blendProfits = orders.reduce((acc, order) => {
            if (order.profit) {
                acc[order.blend_name] = (acc[order.blend_name] || 0) + order.profit;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(blendProfits)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, profit]) => ({ name, 'الربح': profit }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topBlendsData} layout="vertical" margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} tickFormatter={(value) => `${value} ج.م`} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tick={{ textAnchor: 'end' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} جنيه`, 'إجمالي الربح']} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="الربح" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopProfitableBlendsChart;