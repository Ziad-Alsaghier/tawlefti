import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveOrderCard from '@/components/roaster/LiveOrderCard';
import LiveReportsTab from '@/components/roaster/LiveReportsTab';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import CostInputDialog from '@/components/roaster/CostInputDialog';
import { showSuccess, showError } from '@/utils/toast';

const fetchLiveOrders = async (): Promise<Order[]> => {
    const statuses: OrderStatus[] = ['pending', 'processing', 'shipped'];
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', statuses)
        .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
};

const getNotificationTemplate = async (status: string, variables: Record<string, string>) => {
    try {
        const { data, error } = await supabase
            .from('notification_templates')
            .select('title_template, body_template')
            .eq('status', status)
            .eq('is_active', true)
            .maybeSingle();

        if (error || !data) {
            return {
                title: 'تحديث حالة الطلب',
                body: `تم تحديث حالة طلبك إلى ${status}`
            };
        }

        let title = data.title_template || '';
        let body = data.body_template || '';
        Object.entries(variables || {}).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            title = title.replace(regex, value);
            body = body.replace(regex, value);
        });
        return { title, body };
    } catch (err) {
        console.error('Unexpected error in getNotificationTemplate', err);
        return {
            title: 'تحديث حالة الطلب',
            body: `تم تحديث حالة طلبك إلى ${status}`
        };
    }
};

const sendOrderNotification = async (userId: string | null | undefined, orderId: string, status: string, variables: Record<string, string>) => {
    try {
        if (!userId) {
            console.warn('No userId, skipping notification.', { orderId, status });
            return;
        }

        const { title, body } = await getNotificationTemplate(status, variables);

        const { error } = await supabase
            .from('notifications')
            .insert({
                order_id: orderId,
                user_id: userId,
                title,
                body,
                status: 'unread',
            });

        if (error) console.error('Error inserting notification', error);
    } catch (err) {
        console.error('Unexpected error in sendOrderNotification', err);
    }
};

const LiveOperationsPage = () => {
    const queryClient = useQueryClient();
    const [alertedOrderIds, setAlertedOrderIds] = useState<Set<string>>(new Set());
    const { signOut, profile, user } = useAuth();
    const navigate = useNavigate();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
    const [orderForCostInput, setOrderForCostInput] = useState<Order | null>(null);
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    const pendingSoundRef = useRef<HTMLAudioElement | null>(null);
    const processingSoundRef = useRef<HTMLAudioElement | null>(null);
    const timeoutSoundRef = useRef<HTMLAudioElement | null>(null);

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['liveOrders'],
        queryFn: fetchLiveOrders,
    });

    useEffect(() => {
        if (!pendingSoundRef.current) {
            pendingSoundRef.current = new Audio('/sounds/notification_one.mp3');
        }
        if (!processingSoundRef.current) {
            processingSoundRef.current = new Audio('/sounds/notification_one.mp3');
        }
        if (!timeoutSoundRef.current) {
            timeoutSoundRef.current = new Audio('/sounds/notification_one.mp3');
        }
    }, []);

    const playSound = (sound: 'pending' | 'processing' | 'timeout') => {
        if (!audioUnlocked) {
            console.log('Audio not unlocked yet');
            return;
        }
        const audioRef =
            sound === 'pending'
                ? pendingSoundRef.current
                : sound === 'processing'
                    ? processingSoundRef.current
                    : timeoutSoundRef.current;

        if (audioRef) {
            audioRef.currentTime = 0;
            audioRef.play().catch(err => {
                console.error('Audio play failed:', err);
            });
        }
    };

    useEffect(() => {
        if (orders) {
            setAlertedOrderIds(new Set(orders.map(o => o.id)));
        }
    }, [orders]);

    // 🔊 Check for timeout or reminder every 1 minute
    useEffect(() => {
        if (!orders || orders.length === 0) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();

            orders
                .filter(o => o.status === 'pending')
                .forEach(order => {
                    const createdAt = new Date(order.created_at).getTime();
                    const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));

                    // Timeout alert (after 10 minutes)
                    if (diffMinutes >= 10 && diffMinutes % 10 === 0) {
                        console.log(`Order ${order.id} reminder at ${diffMinutes} minutes.`);
                        playSound('timeout');
                        showSuccess(`تنبيه: الطلب رقم ${order.id} ما زال معلق منذ ${diffMinutes} دقيقة!`);
                    }
                });
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [orders, audioUnlocked]);

    useEffect(() => {
        const channel = supabase
            .channel('live-operations-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                try {
                    if (!payload?.new) return;
                    const updatedOrder = payload.new as Order;
                    const eventType = payload.eventType || (payload as any).event;

                    if (eventType === 'INSERT' && updatedOrder.status === 'pending' && !alertedOrderIds.has(updatedOrder.id)) {
                        playSound('pending');
                    }

                    if (eventType === 'UPDATE' && updatedOrder.status === 'processing') {
                        playSound('processing');
                        showSuccess(`الطلب رقم ${updatedOrder.id} قيد التجهيز الآن.`);
                    }

                    queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
                    queryClient.invalidateQueries({ queryKey: ['liveReportsOrders'] });
                } catch (err) {
                    console.error('Error in realtime payload handler:', err);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel).catch(() => { });
        };
    }, [queryClient, alertedOrderIds]);

    const handleStatusChange = useCallback(async (order: Order, newStatus: OrderStatus) => {
        try {
            if (newStatus === 'cancelled') {
                setOrderToCancel(order);
                setCancelDialogOpen(true);
                return;
            }

            if (newStatus === 'completed') {
                setOrderForCostInput(order);
                setIsCostDialogOpen(true);
                return;
            }

            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', order.id);

            if (error) throw error;

            await sendOrderNotification(order.user_id, order.id, newStatus, {
                order_id_short: order.id.slice(0, 6),
                blend_name: order.blend_name || ''
            });

            showSuccess(`تم تحديث حالة الطلب رقم ${order.id} إلى ${newStatus}.`);
        } catch (err: any) {
            showError(`حدث خطأ أثناء تحديث الطلب: ${err.message}`);
        } finally {
            queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
            queryClient.invalidateQueries({ queryKey: ['liveReportsOrders'] });
        }
    }, [queryClient]);

    const confirmCancel = async () => {
        if (!orderToCancel || !cancelReason.trim()) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled', cancel_reason: cancelReason })
                .eq('id', orderToCancel.id);

            if (error) throw error;

            await sendOrderNotification(orderToCancel.user_id, orderToCancel.id, 'cancelled', {
                order_id_short: orderToCancel.id.slice(0, 6),
                blend_name: orderToCancel.blend_name || ''
            });

            showSuccess('تم إلغاء الطلب بنجاح.');
        } catch (err: any) {
            showError(`حدث خطأ أثناء الإلغاء: ${err.message}`);
        } finally {
            queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
            queryClient.invalidateQueries({ queryKey: ['liveReportsOrders'] });
            setCancelDialogOpen(false);
            setOrderToCancel(null);
            setCancelReason('');
        }
    };

    const handleConfirmCost = async (orderId: string, cost: number) => {
        if (!user?.id) {
            showError('User not authenticated. Cannot record payout.');
            return;
        }

        try {
            const { error: payoutError } = await supabase
                .from('roastery_payouts')
                .insert({
                    order_id: orderId,
                    payout_amount: cost,
                    recorded_by: user.id,
                });

            if (payoutError) throw payoutError;

            const { error: orderUpdateError, data: orderData } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', orderId)
                .select('*')
                .single();

            if (orderUpdateError) throw orderUpdateError;

            const uid = (orderData as any)?.user_id ?? (orderData as any)?.customer_id ?? user.id;

            await sendOrderNotification(uid, (orderData as any).id, 'completed', {
                order_id_short: (orderData as any).id.slice(0, 6),
                blend_name: (orderData as any).blend_name || ''
            });

            showSuccess('تم إتمام الطلب وتسجيل تكلفة المحمصة بنجاح.');
        } catch (error: any) {
            showError(`فشل إتمام الطلب أو تسجيل التكلفة: ${error.message}`);
        } finally {
            queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
            queryClient.invalidateQueries({ queryKey: ['liveReportsOrders'] });
            setIsCostDialogOpen(false);
            setOrderForCostInput(null);
        }
    };

    const columns = useMemo(() => {
        const pending = orders?.filter(o => o.status === 'pending') || [];
        const processing = orders?.filter(o => o.status === 'processing') || [];
        const shipped = orders?.filter(o => o.status === 'shipped') || [];
        return { pending, processing, shipped };
    }, [orders]);

    const unlockAudio = () => {
        const unlock = (audioRef: HTMLAudioElement | null) => {
            if (!audioRef) return;
            audioRef.play().then(() => {
                audioRef.pause();
                audioRef.currentTime = 0;
            }).catch(err => {
                console.error('Failed to unlock audio:', err);
            });
        };

        unlock(pendingSoundRef.current);
        unlock(processingSoundRef.current);
        unlock(timeoutSoundRef.current);

        setAudioUnlocked(true);
        showSuccess('تم تفعيل إشعارات الصوت بنجاح.');
    };

    const LiveBoard = () => (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
            <div className="bg-background rounded-lg p-4 flex flex-col">
                <h2 className="flex-shrink-0 text-xl font-semibold mb-4 text-center">
                    طلبات جديدة ({columns.pending.length})
                </h2>
                <div className="flex-grow overflow-y-auto p-1">
                    {columns.pending.map(order => (
                        <LiveOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            </div>
            <div className="bg-background rounded-lg p-4 flex flex-col">
                <h2 className="flex-shrink-0 text-xl font-semibold mb-4 text-center">
                    قيد التجهيز ({columns.processing.length})
                </h2>
                <div className="flex-grow overflow-y-auto p-1">
                    {columns.processing.map(order => (
                        <LiveOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            </div>
            <div className="bg-background rounded-lg p-4 flex flex-col">
                <h2 className="flex-shrink-0 text-xl font-semibold mb-4 text-center">
                    جاهز للتسليم ({columns.shipped.length})
                </h2>
                <div className="flex-grow overflow-y-auto p-1">
                    {columns.shipped.map(order => (
                        <LiveOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-muted/40 p-4" dir="rtl">
            <header className="flex-shrink-0 flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Volume2 className="text-primary" /> العمليات الحية
                </h1>
                {!audioUnlocked && (
                    <Button onClick={unlockAudio}>
                        <Volume2 className="h-4 w-4 ml-2" /> تفعيل الصوت
                    </Button>
                )}
                <div className="flex items-center gap-2">
                    {profile?.role === 'admin' && (
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <Link to="/admin/dashboard" aria-label="Admin Dashboard">
                                <Shield className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => { signOut(); navigate('/login'); }}>
                        تسجيل الخروج
                    </Button>
                </div>
            </header>

            <Tabs defaultValue="board" className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-2 max-w-sm self-center">
                    <TabsTrigger value="board">لوحة المتابعة</TabsTrigger>
                    <TabsTrigger value="reports">تقارير</TabsTrigger>
                </TabsList>
                <TabsContent value="board" className="flex-grow mt-4 flex flex-col">
                    {isLoading ? (
                        <div className="flex-grow flex justify-center items-center">
                            <Loader2 className="h-12 w-12 animate-spin" />
                        </div>
                    ) : (
                        <LiveBoard />
                    )}
                </TabsContent>
                <TabsContent value="reports" className="flex-grow mt-4 overflow-hidden">
                    <LiveReportsTab />
                </TabsContent>
            </Tabs>

            <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => {
                setCancelDialogOpen(open);
                if (!open) {
                    setOrderToCancel(null);
                    setCancelReason('');
                }
            }}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من إلغاء الطلب؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم إلغاء طلب العميل "{orderToCancel?.customer_name}". لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="cancel-reason">سبب الإلغاء (إجباري)</Label>
                        <Textarea
                            id="cancel-reason"
                            placeholder="مثال: بناءً على طلب العميل، عدم توفر المنتج..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancel}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={!cancelReason.trim()}
                        >
                            نعم، قم بالإلغاء
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CostInputDialog
                isOpen={isCostDialogOpen}
                setIsOpen={setIsCostDialogOpen}
                order={orderForCostInput}
                onConfirm={handleConfirmCost}
            />
        </div>
    );
};

export default LiveOperationsPage;
