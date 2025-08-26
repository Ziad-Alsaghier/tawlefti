import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order, CustomerLoyalty } from '@/types/supabase';

interface CustomerTypeChartProps {
    orders: Pick<Order, 'customer_phone'>[];
    loyaltyData: Pick<CustomerLoyalty, 'phone_number'>[];
}

const COLORS = {
    new: '#FFBB28',
    returning: '#00C49F',
    loyal: '#0088FE',
};

const CustomerTypeChart = ({ orders, loyaltyData }: CustomerTypeChartProps) => {
    const data = useMemo(() => {
        const customerOrderCounts = new Map<string, number>();
        orders.forEach(order => {
            customerOrderCounts.set(order.customer_phone, (customerOrderCounts.get(order.customer_phone) || 0) + 1);
        });

        const loyalCustomers = new Set(loyaltyData.map(l => l.phone_number));

        let newCustomers = 0;
        let returningCustomers = 0;
        let loyalCustomersCount = 0;

        for (const [phone, count] of customerOrderCounts.entries()) {
            if (loyalCustomers.has(phone)) {
                loyalCustomersCount++;
            } else if (count === 1) {
                newCustomers++;
            } else {
                returningCustomers++;
            }
        }

        return [
            { name: 'عملاء جدد', value: newCustomers, color: COLORS.new },
            { name: 'عملاء عائدون', value: returningCustomers, color: COLORS.returning },
            { name: 'عملاء أوفياء', value: loyalCustomersCount, color: COLORS.loyal },
        ];
    }, [orders, loyaltyData]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Tooltip formatter={(value: number, name: string) => [`${value} عميل`, name]} />
                <Legend />
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={5} label>
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomerTypeChart;