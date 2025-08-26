import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, BannedPhone, CustomerLoyalty } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, Phone, ShoppingCart, DollarSign, Ban, CheckCircle, ArrowRight, Star, PlusCircle, MinusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { fetchCustomerData } from '@/queries/customers';

const CustomerDetailsPage = () => {
    const { phone } = useParams<{ phone: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, profile: adminProfile } = useAuth();
    const [banReason, setBanReason] = useState('');
    const [pointsToAdjust, setPointsToAdjust] = useState<number | ''>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['customerDetails', phone],
        queryFn: () => fetchCustomerData(phone!),
        enabled: !!phone,
    });

    const notesSchema = z.object({
        admin_notes: z.string().optional(),
    });

    const notesForm = useForm<z.infer<typeof notesSchema>>({
        resolver: zodResolver(notesSchema),
    });

    useEffect(() => {
        if (data?.profile) {
            notesForm.reset({ admin_notes: data.profile.admin_notes || '' });
        }
    }, [data?.profile, notesForm.reset]);

    const handleSaveNotes = async (values: z.infer<typeof notesSchema>) => {
        if (!data?.profile) return;
        const toastId = showLoading('جاري حفظ الملاحظات...');
        const { error } = await supabase
            .from('profiles')
            .update({ admin_notes: values.admin_notes })
            .eq('id', data.profile.id);
        dismissToast(toastId);
        if (error) {
            showError(`فشل حفظ الملاحظات: ${error.message}`);
        } else {
            showSuccess('تم حفظ الملاحظات بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['customerDetails', phone] });
        }
    };

    const customerName = data?.orders?.[0]?.customer_name;
    const totalSpent = data?.orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
    const loyaltyPoints = data?.loyalty?.points || 0;

    const handleBan = async () => {
        if (!phone) return;
        const { error } = await supabase.from('banned_phones').insert({ phone_number: phone, reason: banReason });
        if (error) {
            showError(`فشل حظر العميل: ${error.message}`);
        } else {
            showSuccess('تم حظر العميل بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['customerDetails', phone] });
        }
    };

    const handleUnban = async () => {
        if (!phone) return;
        const { error } = await supabase.from('banned_phones').delete().eq('phone_number', phone);
        if (error) {
            showError(`فشل رفع الحظر: ${error.message}`);
        } else {
            showSuccess('تم رفع الحظر عن العميل.');
            queryClient.invalidateQueries({ queryKey: ['customerDetails', phone] });
        }
    };

    const handleAdjustPoints = async (adjustmentType: 'add' | 'subtract') => {
        if (!phone || pointsToAdjust === '' || pointsToAdjust <= 0 || !adjustmentReason) {
            showError('الرجاء إدخال عدد النقاط وسبب التعديل.');
            return;
        }

        const pointsChange = adjustmentType === 'add' ? pointsToAdjust : -pointsToAdjust;
        const newTotalPoints = loyaltyPoints + pointsChange;

        if (newTotalPoints < 0) {
            showError('لا يمكن أن يكون رصيد نقاط العميل سالبًا.');
            return;
        }

        const toastId = showLoading('جاري تعديل النقاط...');

        const { error: loyaltyError } = await supabase
            .from('customer_loyalty')
            .upsert({ phone_number: phone, points: newTotalPoints }, { onConflict: 'phone_number' });

        if (loyaltyError) {
            dismissToast(toastId);
            showError(`فشل تحديث النقاط: ${loyaltyError.message}`);
            return;
        }

        await supabase.from('loyalty_log').insert({
            customer_phone: phone,
            points_change: pointsChange,
            reason: adjustmentReason,
            admin_id: user?.id,
        });

        dismissToast(toastId);
        showSuccess('تم تعديل نقاط العميل بنجاح.');
        setPointsToAdjust('');
        setAdjustmentReason('');
        queryClient.invalidateQueries({ queryKey: ['customerDetails', phone] });
        queryClient.invalidateQueries({ queryKey: ['allCustomerLoyalty'] });
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <p className="text-destructive text-center p-8">{(error as Error).message}</p>;

    return (
        <div className="space-y-8">
            <Button variant="ghost" onClick={() => navigate('/admin/customers')}>
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى قائمة العملاء
            </Button>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> {customerName}</CardTitle>
                        <CardDescription dir="ltr" className="text-left pt-1">{phone}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-3">
                        <div className="flex items-center gap-2"><ShoppingCart className="text-muted-foreground" /> <span>{data?.orders?.length || 0} طلب</span></div>
                        <div className="flex items-center gap-2"><DollarSign className="text-muted-foreground" /> <span>{totalSpent.toFixed(2)} جنيه</span></div>
                        <div className="flex items-center gap-2"><Star className="text-muted-foreground" /> <span>{loyaltyPoints} نقطة</span></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 items-start">
                <Card className={data?.banStatus ? "border-destructive bg-destructive/10" : "border-green-500 bg-green-500/10"}>
                    <CardHeader><CardTitle className="flex items-center gap-2">{data?.banStatus ? <><Ban /> حالة الحظر</> : <><CheckCircle /> حالة العميل</>}</CardTitle></CardHeader>
                    <CardContent>{data?.banStatus ? <Alert variant="destructive"><AlertTitle>هذا العميل محظور!</AlertTitle><AlertDescription>{data.banStatus.reason || 'لا يوجد سبب مسجل.'}</AlertDescription></Alert> : <p>هذا العميل في وضع جيد ويمكنه إتمام الطلبات.</p>}</CardContent>
                    <CardFooter>{data?.banStatus ? <Button variant="outline" onClick={handleUnban}>رفع الحظر</Button> : <div className="w-full space-y-2"><Textarea placeholder="سبب الحظر (اختياري)" value={banReason} onChange={(e) => setBanReason(e.target.value)} /><Button variant="destructive" className="w-full" onClick={handleBan}>حظر العميل</Button></div>}</CardFooter>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Star /> إدارة نقاط الولاء</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div><label htmlFor="points-adjust" className="block mb-2 text-sm font-medium">عدد النقاط</label><Input id="points-adjust" type="number" placeholder="مثال: 50" value={pointsToAdjust} onChange={(e) => setPointsToAdjust(e.target.value === '' ? '' : parseInt(e.target.value))} /></div>
                        <div><label htmlFor="reason-adjust" className="block mb-2 text-sm font-medium">سبب التعديل</label><Textarea id="reason-adjust" placeholder="مثال: مكافأة لعميل مميز" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} /></div>
                    </CardContent>
                    <CardFooter className="flex gap-2"><Button className="flex-1" onClick={() => handleAdjustPoints('add')}><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button><Button variant="destructive" className="flex-1" onClick={() => handleAdjustPoints('subtract')}><MinusCircle className="ml-2 h-4 w-4" /> خصم</Button></CardFooter>
                </Card>
            </div>

            {adminProfile?.role === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>ملاحظات إدارية</CardTitle>
                        <CardDescription>هذه الملاحظات خاصة بالمسؤولين فقط.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...notesForm}>
                            <form onSubmit={notesForm.handleSubmit(handleSaveNotes)} className="space-y-4">
                                <FormField
                                    control={notesForm.control}
                                    name="admin_notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="أضف ملاحظات حول العميل (مثال: يفضل التحميص الغامق، عميل مهم...)"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={notesForm.formState.isSubmitting}>
                                        {notesForm.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                                        حفظ الملاحظات
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>سجل الطلبات</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>التوليفة</TableHead><TableHead>السعر</TableHead><TableHead>الحالة</TableHead></TableRow></TableHeader>
                        <TableBody>{data?.orders?.map(order => (<TableRow key={order.id}><TableCell>{new Date(order.created_at).toLocaleString('ar-EG')}</TableCell><TableCell>{order.blend_name}</TableCell><TableCell>{order.total_price?.toFixed(2)} جنيه</TableCell><TableCell><Badge>{order.status}</Badge></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerDetailsPage;