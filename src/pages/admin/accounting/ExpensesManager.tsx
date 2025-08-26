import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ExpenseForm from '@/components/admin/accounting/ExpenseForm';

interface TransactionWithCategory extends Transaction {
    expense_categories: { name_ar: string } | null;
}

const fetchExpenses = async (): Promise<TransactionWithCategory[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, expense_categories(name_ar)')
        .eq('type', 'expense')
        .is('related_purchase_id', null) // Fetch only manual expenses
        .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
};

const ExpensesManager = () => {
    const [showForm, setShowForm] = useState(false);

    const { data: expenses, isLoading, error } = useQuery<TransactionWithCategory[]>({
        queryKey: ['transactions', 'manual_expenses'],
        queryFn: fetchExpenses,
    });

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة المصروفات</h1>
                <Button onClick={() => setShowForm(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مصروف جديد
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>سجل المصروفات اليدوية</CardTitle>
                    <CardDescription>هنا يمكنك تتبع المصروفات غير المتعلقة بالمشتريات المباشرة، مثل المرتبات والإيجار.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {expenses && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الفئة</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map(ex => (
                                    <TableRow key={ex.id}>
                                        <TableCell>{new Date(ex.date).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>{ex.expense_categories?.name_ar || 'غير محدد'}</TableCell>
                                        <TableCell>{ex.description}</TableCell>
                                        <TableCell className="font-medium text-destructive">{ex.amount.toFixed(2)} جنيه</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ExpenseForm isOpen={showForm} setIsOpen={setShowForm} />
        </>
    );
};

export default ExpensesManager;