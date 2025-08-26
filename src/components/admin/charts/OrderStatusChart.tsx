import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order, OrderStatus } from '@/types/supabase';

interface OrderStatusChartProps {
    orders: Order[];
}

const statusLabels: Record<OrderStatus, string> = {
    pending: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const COLORS: Record<OrderStatus, string> = {
    pending: '#f59e0b', // amber-500
    processing: '#3b82f6', // blue-500
    shipped: '#8b5cf6', // violet-500
    completed: '#22c55e', // green-500
    cancelled: '#ef4444', // red-500
};

const OrderStatusChart = ({ orders }: OrderStatusChartProps) => {
    const statusData = useMemo(() => {
        const counts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);

        return Object.entries(counts).map(([status, count]) => ({
            name: statusLabels[status as OrderStatus],
            value: count,
            color: COLORS[status as OrderStatus],
        }));
    }, [orders]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Tooltip formatter={(value: number, name: string) => [`${value} طلب`, name]} />
                <Legend />
                <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                >
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default OrderStatusChart;