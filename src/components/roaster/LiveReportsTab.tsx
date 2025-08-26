import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { subHours, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const fetchRecentOrders = async (): Promise<Order[]> => {
    const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['completed', 'cancelled'])
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
};

const LiveReportsTab = () => {
    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['liveReportsOrders'],
        queryFn: fetchRecentOrders,
    });

    const stats = useMemo(() => {
        if (!orders) return { completed: 0, cancelled: 0 };
        return {
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };
    }, [orders]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <p className="text-destructive text-center p-8">{(error as Error).message}</p>;
    }

    return (
        <div className="space-y-6 p-4 h-full overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">طلبات مكتملة (24 ساعة)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">طلبات ملغاة (24 ساعة)</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cancelled}</div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>سجل الطلبات الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>العميل</TableHead>
                                <TableHead>التوليفة</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>الوقت</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders && orders.length > 0 ? orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>{order.blend_name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                        </span>
                                        {order.status === 'cancelled' && order.cancel_reason && (
                                            <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={order.cancel_reason}>
                                                {order.cancel_reason}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        لا توجد طلبات مكتملة أو ملغاة في آخر 24 ساعة.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveReportsTab;