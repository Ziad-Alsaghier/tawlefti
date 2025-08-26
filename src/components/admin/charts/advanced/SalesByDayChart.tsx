import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order } from '@/types/supabase';
import { parseISO, getDay } from 'date-fns';

interface SalesByDayChartProps {
    orders: Pick<Order, 'created_at'>[];
}

const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#82ca9d'];

const SalesByDayChart = ({ orders }: SalesByDayChartProps) => {
    const data = useMemo(() => {
        const dailySales = Array(7).fill(0);
        orders.forEach(order => {
            const day = getDay(parseISO(order.created_at));
            dailySales[day] += 1;
        });
        return dailySales.map((sales, i) => ({ name: daysOfWeek[i], value: sales }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Tooltip formatter={(value: number, name: string) => [`${value} طلب`, name]} />
                <Legend />
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default SalesByDayChart;