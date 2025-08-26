import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, CustomerLoyalty } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, UserPlus, Repeat, Star, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const fetchAllOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const fetchAllLoyalty = async (): Promise<CustomerLoyalty[]> => {
    const { data, error } = await supabase.from('customer_loyalty').select('*');
    if (error) throw new Error(error.message);
    return data;
};

type CustomerSegment = 'New' | 'Returning' | 'Loyal' | 'At-Risk';

const getCustomerSegment = (orderCount: number, lastOrderDate: Date): CustomerSegment => {
    if (differenceInDays(new Date(), lastOrderDate) > 60) {
        return 'At-Risk';
    }
    if (orderCount === 1) {
        return 'New';
    }
    if (orderCount > 1 && orderCount <= 5) {
        return 'Returning';
    }
    if (orderCount > 5) {
        return 'Loyal';
    }
    return 'New'; // Fallback for 0 orders, though they shouldn't appear
};

const segmentConfig: Record<CustomerSegment, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ElementType }> = {
    'New': { label: 'جديد', variant: 'default', icon: UserPlus },
    'Returning': { label: 'عائد', variant: 'secondary', icon: Repeat },
    'Loyal': { label: 'وفي', variant: 'default', icon: Star },
    'At-Risk': { label: 'معرض للخطر', variant: 'destructive', icon: AlertTriangle },
};

const CustomersManager = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading: isLoadingOrders, error: ordersError } = useQuery<Order[]>({
        queryKey: ['allOrdersForCustomers'],
        queryFn: fetchAllOrders,
    });
    const { data: loyaltyData, isLoading: isLoadingLoyalty, error: loyaltyError } = useQuery<CustomerLoyalty[]>({
        queryKey: ['allCustomerLoyalty'],
        queryFn: fetchAllLoyalty,
    });

    const customers = useMemo(() => {
        if (!orders) return [];
        
        const customerData = orders.reduce((acc, order) => {
            const phone = order.customer_phone;
            if (!acc[phone]) {
                acc[phone] = {
                    phone: phone,
                    name: order.customer_name,
                    totalSpent: 0,
                    orderCount: 0,
                    lastOrderDate: new Date(0),
                };
            }
            acc[phone].totalSpent += order.total_price || 0;
            acc[phone].orderCount += 1;
            if (new Date(order.created_at) > acc[phone].lastOrderDate) {
                acc[phone].lastOrderDate = new Date(order.created_at);
                acc[phone].name = order.customer_name;
            }
            return acc;
        }, {} as Record<string, { phone: string; name: string; totalSpent: number; orderCount: number; lastOrderDate: Date }>);

        const loyaltyMap = new Map(loyaltyData?.map(l => [l.phone_number, l.points]));

        return Object.values(customerData)
            .map(c => ({ 
                ...c, 
                points: loyaltyMap.get(c.phone) || 0,
                segment: getCustomerSegment(c.orderCount, c.lastOrderDate)
            }))
            .sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());
    }, [orders, loyaltyData]);

    const isLoading = isLoadingOrders || isLoadingLoyalty;
    const error = ordersError || loyaltyError;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة العملاء</h1>
                <p className="text-muted-foreground mt-2">عرض جميع عملائك وسجل طلباتهم وفئاتهم.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {customers.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>رقم الهاتف</TableHead>
                                    <TableHead>فئة العميل</TableHead>
                                    <TableHead>الطلبات</TableHead>
                                    <TableHead>الإنفاق</TableHead>
                                    <TableHead>النقاط</TableHead>
                                    <TableHead>آخر طلب</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map(customer => {
                                    const config = segmentConfig[customer.segment];
                                    const isLoyal = customer.segment === 'Loyal';
                                    return (
                                        <TableRow key={customer.phone}>
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell dir="ltr" className="text-left">{customer.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant={config.variant} className={cn(isLoyal && 'bg-amber-500 text-white hover:bg-amber-600')}>
                                                    <config.icon className="ml-1 h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{customer.orderCount}</TableCell>
                                            <TableCell className="font-bold text-primary">{customer.totalSpent.toFixed(2)} جنيه</TableCell>
                                            <TableCell className="font-bold text-amber-500">{customer.points}</TableCell>
                                            <TableCell>{customer.lastOrderDate.toLocaleDateString('ar-EG')}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/customer/${customer.phone}`)}>
                                                    عرض التفاصيل <ArrowLeft className="mr-2 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomersManager;