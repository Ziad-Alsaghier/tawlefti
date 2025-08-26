import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoasteryPayout } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, DollarSign } from 'lucide-react';
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';

interface RoasteryPayoutWithDetails extends RoasteryPayout {
    orders: { customer_name: string; blend_name: string; total_price: number | null } | null;
    profiles: { full_name: string | null } | null;
}

const fetchRoasteryPayouts = async (dateRange?: DateRange): Promise<RoasteryPayoutWithDetails[]> => {
    let query = supabase
        .from('roastery_payouts')
        .select(`*, orders(customer_name, blend_name, total_price), profiles(full_name)`);

    if (dateRange?.from) {
        query = query.gte('payout_date', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the whole 'to' day
        query = query.lte('payout_date', toDate.toISOString());
    }

    const { data, error } = await query.order('payout_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as RoasteryPayoutWithDetails[];
};

const RoasteryPayoutsManager = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const { data: payouts, isLoading, error } = useQuery<RoasteryPayoutWithDetails[]>({
        queryKey: ['roasteryPayouts', date],
        queryFn: () => fetchRoasteryPayouts(date),
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-right">
                    <h1 className="text-3xl font-bold">مدفوعات المحامص</h1>
                    <p className="text-muted-foreground mt-2">سجل بجميع المبالغ المستحقة للمحامص لكل طلب مكتمل.</p>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> سجل المدفوعات</CardTitle>
                    <CardDescription>
                        هنا يمكنك تتبع المبالغ التي تم تسجيلها كمدفوعات للمحمصة لكل طلب.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {payouts && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الطلب</TableHead>
                                    <TableHead>العميل</TableHead>
                                    <TableHead>التوليفة</TableHead>
                                    <TableHead>المبلغ المدفوع من العميل</TableHead> {/* New Column */}
                                    <TableHead>المبلغ المستحق للمحمصة</TableHead>
                                    <TableHead>سجل بواسطة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{new Date(p.payout_date).toLocaleString('ar-EG')}</TableCell>
                                        <TableCell className="font-mono text-xs">{p.order_id.substring(0, 8)}</TableCell>
                                        <TableCell>{p.orders?.customer_name || 'غير معروف'}</TableCell>
                                        <TableCell>{p.orders?.blend_name || 'غير معروف'}</TableCell>
                                        <TableCell className="font-medium text-blue-600">{p.orders?.total_price?.toFixed(2) || 'N/A'} جنيه</TableCell> {/* Display Customer Paid Amount */}
                                        <TableCell className="font-medium text-green-600">{p.payout_amount.toFixed(2)} جنيه</TableCell>
                                        <TableCell>{p.profiles?.full_name || 'غير محدد'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RoasteryPayoutsManager;