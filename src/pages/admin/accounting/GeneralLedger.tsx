import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionWithCategory extends Transaction {
    expense_categories: { name_ar: string } | null;
}

const fetchTransactions = async (): Promise<TransactionWithCategory[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, expense_categories(name_ar)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
};

const GeneralLedger = () => {
    const { data: transactions, isLoading, error } = useQuery<TransactionWithCategory[]>({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
    });

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">دفتر الأستاذ العام</h1>
                <p className="text-muted-foreground mt-2">سجل كامل لجميع المعاملات المالية (إيرادات ومصروفات) بترتيب زمني.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>كل المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {transactions && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead>الفئة</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.date).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>
                                            <span className={cn("flex items-center gap-1", t.type === 'income' ? 'text-green-600' : 'text-destructive')}>
                                                {t.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                                                {t.type === 'income' ? 'إيراد' : 'مصروف'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{t.expense_categories?.name_ar || 'مبيعات'}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className={cn("font-medium", t.type === 'income' ? 'text-green-600' : 'text-destructive')}>
                                            {t.amount.toFixed(2)} جنيه
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default GeneralLedger;