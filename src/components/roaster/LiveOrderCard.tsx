import { Order, OrderStatus } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import OrderTimer from './OrderTimer';
import { getMethodById } from '@/data/coffeeData';

interface LiveOrderCardProps {
    order: Order;
    onStatusChange: (order: Order, status: OrderStatus) => void;
}

interface BlendDataForCard {
    method_id: string | null;
    blend_compositions: {
        percentage: number;
        coffee_types: {
            name_ar: string;
        }[]; // 👈 Changed to an array
    }[];
}

/**
 * Fetch blend data for a given blend code
 */
const fetchBlendData = async (blendCode: string | null): Promise<BlendDataForCard | null> => {
    if (!blendCode) return null;

    const { data, error } = await supabase
        .from('blends')
        .select('method_id, blend_compositions(percentage, coffee_types(name_ar))')
        .eq('code', blendCode)
        .single();

    if (error) {
        console.error('Error fetching blend data for live card:', error.message);
        return null;
    }

    if (data && Array.isArray(data.blend_compositions)) {
        return data as BlendDataForCard;
    }
    throw new Error('Invalid data format');
};

const LiveOrderCard = ({ order, onStatusChange }: LiveOrderCardProps) => {
    const { data: blendData, isLoading } = useQuery({
        queryKey: ['blendDataForLiveCard', order.blend_code],
        queryFn: () => fetchBlendData(order.blend_code),
        enabled: Boolean(order.blend_code),
    });

    // Get preparation method name safely
    const methodName = useMemo(() => {
        if (!blendData?.method_id) return null;
        const method = getMethodById(blendData.method_id);
        return method?.name?.ar || null;
    }, [blendData]);

    // Calculate coffee components with percentages
    const coffeeComponents = useMemo(() => {
        if (!blendData?.blend_compositions) return [];
        return blendData.blend_compositions.map((comp) => {
            const weight = (order.weight_grams || 0) * (comp.percentage / 100);
            return {
                name: comp.coffee_types?.name_ar || 'بن غير معروف',
                weight: weight.toFixed(0),
            };
        });
    }, [blendData, order.weight_grams]);

    // Calculate additives if present
    const additiveWeight = useMemo(
        () => ((order.weight_grams || 0) / 250) * 5,
        [order.weight_grams]
    );

    const additiveComponents = useMemo(
        () =>
            order.additives?.map((additiveName) => ({
                name: additiveName,
                weight: additiveWeight.toFixed(0),
            })) || [],
        [order.additives, additiveWeight]
    );

    // Action buttons depending on order status
    const ActionButtons = () => {
        switch (order.status) {
            case 'pending':
                return (
                    <div className="w-full space-y-2">
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600"
                            onClick={() => onStatusChange(order, 'processing')}
                        >
                            <ArrowLeft className="ml-2 h-4 w-4" />
                            بدء التجهيز
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => onStatusChange(order, 'cancelled')}
                        >
                            <XCircle className="ml-2 h-4 w-4" />
                            إلغاء الطلب
                        </Button>
                    </div>
                );
            case 'processing':
                return (
                    <div className="w-full space-y-2">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => onStatusChange(order, 'pending')}
                            >
                                <ArrowRight className="ml-2 h-4 w-4" />
                                عودة
                            </Button>
                            <Button
                                className="flex-1 bg-green-500 hover:bg-green-600"
                                onClick={() => onStatusChange(order, 'shipped')}
                            >
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                جاهز
                            </Button>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => onStatusChange(order, 'cancelled')}
                        >
                            <XCircle className="ml-2 h-4 w-4" />
                            إلغاء الطلب
                        </Button>
                    </div>
                );
            case 'shipped':
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onStatusChange(order, 'processing')}
                        >
                            <ArrowRight className="ml-2 h-4 w-4" />
                            عودة
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => onStatusChange(order, 'completed')}
                        >
                            <CheckCircle className="ml-2 h-4 w-4" />
                            تم التسليم
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card
            className={cn(
                'mb-4 bg-card shadow-md border-r-4 flex flex-col',
                order.status === 'pending' && 'border-red-500',
                order.status === 'processing' && 'border-amber-500',
                order.status === 'shipped' && 'border-green-500'
            )}
        >
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{order.blend_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                </div>
                {(order.status === 'pending' || order.status === 'processing') && (
                    <OrderTimer createdAt={order.created_at} />
                )}
            </CardHeader>

            <CardContent className="space-y-2 text-sm flex-grow">
                {order.delivery_slot && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 p-2 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span className="font-bold">توصيل: {order.delivery_slot}</span>
                    </div>
                )}
                <p>
                    <strong>الوزن الإجمالي:</strong> {order.weight_grams} جرام
                </p>
                <p>
                    <strong>التحميص:</strong> {order.roast_level}
                </p>
                {methodName && (
                    <p>
                        <strong>طريقة التحضير:</strong> {methodName}
                    </p>
                )}

                <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">مكونات التوليفة:</h4>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : coffeeComponents.length > 0 ? (
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {coffeeComponents.map((comp, index) => (
                                <li key={index}>
                                    {comp.name}:{' '}
                                    <span className="font-bold text-foreground">{comp.weight} جرام</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">لا توجد بيانات توليفة.</p>
                    )}
                </div>

                {additiveComponents.length > 0 && (
                    <div className="pt-1">
                        <h4 className="font-semibold text-foreground mb-1">التحويجات:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {additiveComponents.map((additive, index) => (
                                <li key={index}>
                                    {additive.name}:{' '}
                                    <span className="font-bold text-foreground">{additive.weight} جرام</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-2 mt-auto">
                <ActionButtons />
            </CardFooter>
        </Card>
    );
};

export default memo(LiveOrderCard);
