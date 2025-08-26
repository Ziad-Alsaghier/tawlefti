import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Star, ShoppingCart, Clock } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState, useMemo, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const fetchStoreSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('key, value');
    if (error) throw error;
    const settings: Record<string, any> = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const cart = useCart();
    const { profile, loading: isAuthLoading } = useAuth();
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [isApplyingCode, setIsApplyingCode] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | undefined>(undefined);

    const { data: storeSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['storeSettings'],
        queryFn: fetchStoreSettings,
    });

    useEffect(() => {
        if (storeSettings?.operating_hours) {
            const { open, close } = storeSettings.operating_hours;
            const now = new Date();
            const currentHour = now.getHours();
            const openHour = parseInt(open.split(':')[0]);
            const closeHour = parseInt(close.split(':')[0]);

            if (closeHour < openHour) { // Overnight schedule (e.g., 9 AM to 1 AM)
                setIsStoreOpen(currentHour >= openHour || currentHour < closeHour);
            } else { // Same-day schedule (e.g., 9 AM to 5 PM)
                setIsStoreOpen(currentHour >= openHour && currentHour < closeHour);
            }
        }
    }, [storeSettings]);

    const formSchema = useMemo(() => z.object({
      name: z.string().min(2, { message: t('name_min') }),
      phone: z.string().regex(/^01[0125][0-9]{8}$/, { message: t('phone_invalid') }),
      address: z.string().min(10, { message: t('address_min') }),
    }), [t]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', phone: '', address: '' },
    });

    useEffect(() => {
        if (profile && !isAuthLoading) {
            form.setValue('name', profile.full_name || '');
            form.setValue('phone', profile.phone_number || '');
            form.setValue('address', profile.address || '');
            if (profile.phone_number) {
                cart.fetchLoyaltyPoints(profile.phone_number);
            }
        }
    }, [profile, isAuthLoading, form.setValue, cart.fetchLoyaltyPoints]);

    const handleApplyPromo = async () => {
        setIsApplyingCode(true);
        const success = await cart.applyPromoCode(promoCodeInput);
        if (success) {
            setPromoCodeInput('');
        }
        setIsApplyingCode(false);
    };

    if (!cart.isLoading && cart.cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4" dir={dir}>
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-3xl font-bold text-destructive mb-4">سلة المشتريات فارغة!</h2>
                <p className="text-muted-foreground mb-8">أضف بعض التوليفات الرائعة إلى سلتك أولاً.</p>
                <Button asChild><Link to="/">{t('return_to_home')}</Link></Button>
            </div>
        );
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!isStoreOpen && !selectedSlot) {
            showError("الرجاء اختيار موعد توصيل.");
            return;
        }

        const toastId = showLoading(t('submitting_order'));
        const { data: banned } = await supabase.from('banned_phones').select('phone_number').eq('phone_number', values.phone).single();
        if (banned) {
            dismissToast(toastId);
            showError('هذا الحساب محظور ولا يمكنه إتمام الطلبات. يرجى التواصل مع خدمة العملاء.');
            return;
        }

        const orderPromises = cart.cartItems.map(item => {
            const totalItemPrice = item.price * item.quantity;
            const proportionOfTotal = cart.subtotal > 0 ? totalItemPrice / cart.subtotal : 0;
            const totalDiscount = cart.loyaltyDiscount + cart.promoDiscount;
            const itemDiscount = totalDiscount * proportionOfTotal;
            const itemFinalPrice = totalItemPrice - itemDiscount;
            const itemPointsToRedeem = cart.pointsToRedeem * proportionOfTotal;
            const itemPointsToEarn = Math.floor(itemFinalPrice);

            return supabase.from('orders').insert({
                customer_name: values.name,
                customer_phone: values.phone,
                customer_address: values.address,
                blend_name: item.blend_name_ar,
                blend_code: item.blend_code,
                roast_level: item.roast,
                weight_grams: parseInt(item.weight) * item.quantity,
                additives: item.selectedAdditives.map(a => a.name_ar),
                total_price: itemFinalPrice,
                status: 'pending',
                user_id: profile?.id,
                discount_amount: itemDiscount,
                discount_code: cart.appliedPromoCode ? cart.appliedPromoCode.code : (cart.loyaltyDiscount > 0 ? 'LOYALTY' : null),
                points_earned: itemPointsToEarn,
                points_redeemed: Math.round(itemPointsToRedeem),
                delivery_slot: isStoreOpen ? null : selectedSlot,
            });
        });

        const results = await Promise.all(orderPromises);
        const hasError = results.some(res => res.error);

        dismissToast(toastId);
        if (hasError) {
            console.error('Error saving one or more orders:', results.map(r => r.error).filter(Boolean));
            showError('حدث خطأ أثناء إرسال جزء من الطلب. يرجى المحاولة مرة أخرى.');
        } else {
            const successMessage = isStoreOpen 
                ? 'تم استلام طلبك بنجاح! سنتواصل معك قريبًا.'
                : 'تم استلام طلبك بنجاح! سيتم توصيله في الموعد المحدد.';
            showSuccess(successMessage);
            await cart.clearCart();
            navigate('/');
        }
    };

    const deliverySlots = storeSettings?.delivery_slots?.slots || [];
    const canSubmit = isStoreOpen || (!isStoreOpen && !!selectedSlot);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 relative" dir={dir}>
            <LanguageSwitcher />
            <div className="container mx-auto max-w-4xl">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-primary font-kufam">{t('checkout_title')}</h1>
                    <p className="text-xl text-muted-foreground mt-4">{t('checkout_subtitle')}</p>
                </header>
                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-card shadow-lg">
                        <CardHeader><CardTitle>{t('shipping_details')}</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('full_name')}</FormLabel><FormControl><Input placeholder={t('full_name')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('phone_number')}</FormLabel><FormControl><Input placeholder="01xxxxxxxxx" {...field} onBlur={(e) => cart.fetchLoyaltyPoints(e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>{t('detailed_address')}</FormLabel><FormControl><Textarea placeholder={t('address_min')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/50">
                        <CardHeader><CardTitle>{t('order_summary')}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {cart.cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.blend_name_ar} <span className="text-sm text-muted-foreground">(x{item.quantity})</span></p>
                                        <p className="text-xs text-muted-foreground">{t(item.roast)} / {item.weight}g</p>
                                    </div>
                                    <p className="font-medium">{(item.price * item.quantity).toFixed(0)} {t('egp')}</p>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between text-muted-foreground">
                                <span>{t('subtotal')}:</span>
                                <span>{cart.subtotal.toFixed(0)} {t('egp')}</span>
                            </div>
                            
                            {!cart.appliedPromoCode ? (
                                <div className="flex items-end gap-2 pt-2">
                                    <div className="flex-1">
                                        <Label htmlFor="promo-code" className="text-xs">كود الخصم</Label>
                                        <Input id="promo-code" placeholder="أدخل الكود هنا" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} disabled={isApplyingCode} />
                                    </div>
                                    <Button onClick={handleApplyPromo} disabled={isApplyingCode || !promoCodeInput}>
                                        {isApplyingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "تطبيق"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>خصم الكود ({cart.appliedPromoCode.code}):</span>
                                        <span className="font-medium">- {cart.promoDiscount.toFixed(0)} {t('egp')}</span>
                                    </div>
                                    <Button variant="link" size="sm" className="text-destructive p-0 h-auto" onClick={cart.removePromoCode}>إزالة الكود</Button>
                                </div>
                            )}

                            {cart.isFetchingPoints ? <Loader2 className="animate-spin" /> : cart.customerPoints > 0 && (
                                <div className="p-3 bg-yellow-400/20 rounded-lg mt-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="redeem-switch" className="flex items-center gap-2 cursor-pointer"><Star className="text-yellow-500" /><span>لديك {cart.customerPoints} نقطة (تساوي {Math.floor(cart.customerPoints / 10)} جنيه)</span></Label>
                                        <Switch id="redeem-switch" checked={cart.redeemPoints} onCheckedChange={cart.setRedeemPoints} />
                                    </div>
                                </div>
                            )}
                            {cart.loyaltyDiscount > 0 && <div className="flex justify-between text-destructive"><span>{t('loyalty_discount')}:</span><span className="font-medium">- {cart.loyaltyDiscount.toFixed(0)} {t('egp')}</span></div>}
                            <Separator />
                            <div className="flex justify-between items-center text-2xl font-bold">
                                <span>{t('total')}:</span>
                                {cart.isLoading ? <Loader2 className="animate-spin" /> : <span className="text-primary">{cart.total.toFixed(0)} {t('egp')}</span>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-4">
                            {!isStoreOpen && (
                                <Alert variant="default" className="bg-amber-100 dark:bg-amber-900/50 border-amber-400">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle>مواعيد العمل مغلقة حاليًا</AlertTitle>
                                    <AlertDescription>
                                        الطلبات الآن ستكون للتوصيل غدًا. الرجاء اختيار فترة التوصيل المناسبة:
                                        <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot} className="mt-4 space-y-2">
                                            {deliverySlots.map((slot: string) => (
                                                <div key={slot} className="flex items-center space-x-2 space-x-reverse">
                                                    <RadioGroupItem value={slot} id={slot} />
                                                    <Label htmlFor={slot}>{slot}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button size="lg" className="w-full text-lg" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting || cart.isLoading || !canSubmit}>{form.formState.isSubmitting ? t('submitting_order') : t('confirm_order')}</Button>
                            <Button variant="link" onClick={() => navigate('/')}><ArrowLeft className="ml-2 h-4 w-4" />العودة للتسوق</Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default CheckoutPage;