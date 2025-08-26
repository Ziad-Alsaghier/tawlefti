import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FixedExpense } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess, showError } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import FixedExpenseForm from '@/components/admin/accounting/FixedExpenseForm';
import { Badge } from '@/components/ui/badge';

interface FixedExpenseWithCategory extends FixedExpense {
    expense_categories: { name_ar: string } | null;
}

const fetchFixedExpenses = async (): Promise<FixedExpenseWithCategory[]> => {
    const { data, error } = await supabase.from('fixed_expenses').select('*, expense_categories(name_ar)').order('name');
    if (error) throw new Error(error.message);
    return data as FixedExpenseWithCategory[];
};

const frequencyLabels: Record<string, string> = {
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي',
};

const FixedExpensesManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<FixedExpense | null>(null);

    const { data: expenses, isLoading, error } = useQuery<FixedExpenseWithCategory[]>({
        queryKey: ['fixed_expenses'],
        queryFn: fetchFixedExpenses,
    });

    const handleAddNew = () => {
        setSelectedExpense(null);
        setShowForm(true);
    };

    const handleEdit = (expense: FixedExpense) => {
        setSelectedExpense(expense);
        setShowForm(true);
    };

    const handleDelete = (expense: FixedExpense) => {
        setExpenseToDelete(expense);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;
        const { error } = await supabase.from('fixed_expenses').delete().eq('id', expenseToDelete.id);
        if (error) {
            showError(`فشل حذف المصروف: ${error.message}`);
        } else {
            showSuccess('تم حذف المصروف الثابت بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['fixed_expenses'] });
        }
        setShowDeleteDialog(false);
        setExpenseToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة المصروفات الثابتة</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مصروف ثابت
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة المصروفات</CardTitle>
                    <CardDescription>سجل بالمصروفات الدورية مثل الإيجارات والرواتب.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {expenses && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                    <TableHead>الفئة</TableHead>
                                    <TableHead>الدورية</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell className="font-medium">{e.name}</TableCell>
                                        <TableCell>{e.amount} جنيه</TableCell>
                                        <TableCell>{e.expense_categories?.name_ar || '-'}</TableCell>
                                        <TableCell><Badge variant="outline">{frequencyLabels[e.frequency]}</Badge></TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(e)}><Edit className="ml-2 h-4 w-4" /><span>تعديل</span></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(e)} className="text-destructive focus:text-destructive"><Trash2 className="ml-2 h-4 w-4" /><span>حذف</span></DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <FixedExpenseForm isOpen={showForm} setIsOpen={setShowForm} expense={selectedExpense} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد بالتأكيد حذف "{expenseToDelete?.name}"؟</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default FixedExpensesManager;