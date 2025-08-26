import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, CustomerLoyalty, Transaction } from '@/types/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListOrdered, Loader2, Clock, MoreHorizontal, Edit } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { fetchOrdersByDateRange } from '@/queries/orders';
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderEditForm from '@/components/admin/OrderEditForm';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import { fetchAllLoyalty } from '@/queries/customers';
import { fetchExpensesByDateRange } from '@/queries/admin';
import DashboardFinancialSummary from '@/components/admin/DashboardFinancialSummary';

const statusConfig: Record<OrderStatus, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'جديد', color: 'default' },
    processing: { label: 'قيد التجهيز', color: 'secondary' },
    shipped: { label: 'تم الشحن', color: 'outline' },
    completed: { label: 'مكتمل', color: 'outline' },
    cancelled: { label: 'ملغي', color: 'destructive' },
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading: isLoadingOrders, error: ordersError } = useQuery<Order[]>({
    queryKey: ['orders', date],
    queryFn: () => fetchOrdersByDateRange(date),
  });

  const { data: expenses, isLoading: isLoadingExpenses, error: expensesError } = useQuery<Pick<Transaction, 'amount'>[]>({
    queryKey: ['expensesForSummary', date],
    queryFn: () => fetchExpensesByDateRange(date),
  });

  const { data: loyaltyData, isLoading: isLoadingLoyalty } = useQuery<Pick<CustomerLoyalty, 'phone_number'>[]>({
    queryKey: ['allLoyaltyForAnalytics'],
    queryFn: fetchAllLoyalty,
  });

  const isLoading = isLoadingOrders || isLoadingLoyalty || isLoadingExpenses;
  const error = ordersError || expensesError;

  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['allOrdersForStats'] });
          queryClient.invalidateQueries({ queryKey: ['allOrdersForCharts'] });
          queryClient.invalidateQueries({ queryKey: ['inventoryForAlerts'] });
          queryClient.invalidateQueries({ queryKey: ['allLoyaltyForAnalytics'] });
          queryClient.invalidateQueries({ queryKey: ['expensesForSummary'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsEditFormOpen(true);
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-right">
                <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
                <p className="text-muted-foreground mt-2">نظرة شاملة على أداء متجرك والطلبات الجديدة.</p>
            </div>
            <DateRangePicker date={date} onDateChange={setDate} />
        </div>

        <DashboardFinancialSummary orders={orders} expenses={expenses} isLoading={isLoading} />
        <DashboardCharts orders={orders} loyaltyData={loyaltyData} isLoading={isLoading} />

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-6 w-6" />
                <span>قائمة الطلبات</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {error && <div className="text-destructive text-center p-8">{(error as Error).message}</div>}
                {orders && (
                <>
                    {orders.length === 0 ? (
                    <Alert>
                        <AlertTitle>لا توجد طلبات في هذه الفترة</AlertTitle>
                        <AlertDescription>حاول تغيير النطاق الزمني لعرض الطلبات.</AlertDescription>
                    </Alert>
                    ) : (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>العميل</TableHead>
                            <TableHead>التوليفة</TableHead>
                            <TableHead>التفاصيل</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>الوقت</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                                <div className="text-xs text-muted-foreground mt-1">{order.customer_address}</div>
                            </TableCell>
                            <TableCell>{order.blend_name}</TableCell>
                            <TableCell>
                                <div>التحميص: {order.roast_level || '-'}</div>
                                <div>الوزن: {order.weight_grams || '-'} جرام</div>
                                {order.additives && order.additives.length > 0 && (
                                <div>إضافات: {order.additives.join(', ')}</div>
                                )}
                                {order.delivery_slot && (
                                    <div className="flex items-center gap-1 mt-2 text-amber-600">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs font-semibold">{order.delivery_slot}</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-bold text-primary">{order.total_price} جنيه</TableCell>
                            <TableCell>
                                <Badge variant={statusConfig[order.status].color}>
                                    {statusConfig[order.status].label}
                                </Badge>
                                {order.status === 'cancelled' && order.cancel_reason && (
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={order.cancel_reason}>
                                        السبب: {order.cancel_reason}
                                    </p>
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(order.created_at).toLocaleString('ar-EG', {
                                day: 'numeric',
                                month: 'short',
                                hour: 'numeric',
                                minute: 'numeric',
                                })}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(order)}>
                                            <Edit className="ml-2 h-4 w-4" />
                                            <span>تعديل</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    )}
                </>
                )}
            </CardContent>
        </Card>
        <LowStockAlerts />
        <OrderEditForm
            isOpen={isEditFormOpen}
            setIsOpen={setIsEditFormOpen}
            order={selectedOrder}
        />
    </div>
  );
};

export default AdminDashboard;