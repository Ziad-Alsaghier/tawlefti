import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useState } from 'react';

const statusConfig: Record<OrderStatus, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'جديد', color: 'default' },
    processing: { label: 'قيد التجهيز', color: 'secondary' },
    shipped: { label: 'تم الشحن', color: 'outline' },
    completed: { label: 'مكتمل', color: 'outline' },
    cancelled: { label: 'ملغي', color: 'destructive' },
};

const fetchUserOrders = async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const OrderHistoryTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['userOrders', user?.id],
        queryFn: () => fetchUserOrders(user!.id),
        enabled: !!user,
    });

    const handleWriteReview = (order: Order) => {
        setReviewingOrder(order);
        setIsReviewFormOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>سجل الطلبات</CardTitle>
                    <CardDescription>جميع طلباتك السابقة والحالية.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {orders && orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>التوليفة</TableHead>
                                    <TableHead>السعر</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{new Date(order.created_at).toLocaleString('ar-EG')}</TableCell>
                                        <TableCell>{order.blend_name}</TableCell>
                                        <TableCell className="font-medium">{order.total_price?.toFixed(2)} جنيه</TableCell>
                                        <TableCell>
                                            <Badge variant={statusConfig[order.status].color}>
                                                {statusConfig[order.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            {order.blend_code && (
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/blend/${order.blend_code}`)}>
                                                    <RefreshCw className="ml-2 h-4 w-4" />
                                                    إعادة الشراء
                                                </Button>
                                            )}
                                            {order.status === 'completed' && order.blend_code && (
                                                <Button variant="outline" size="sm" onClick={() => handleWriteReview(order)}>
                                                    كتابة تقييم
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        !isLoading && <p className="text-muted-foreground text-center py-10">لا توجد طلبات بعد.</p>
                    )}
                </CardContent>
            </Card>
            {reviewingOrder && (
                <ReviewForm
                    isOpen={isReviewFormOpen}
                    setIsOpen={setIsReviewFormOpen}
                    blendCode={reviewingOrder.blend_code!}
                    blendName={reviewingOrder.blend_name}
                />
            )}
        </>
    );
};

export default OrderHistoryTab;