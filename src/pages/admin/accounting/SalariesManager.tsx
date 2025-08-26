import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salary, SalaryPayment } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2, DollarSign, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the new forms
import SalaryForm from './components/SalaryForm';
import LogPaymentForm from './components/LogPaymentForm';


const fetchSalaries = async (): Promise<Salary[]> => {
    const { data, error } = await supabase.from('salaries').select('*').order('employee_name');
    if (error) throw new Error(error.message);
    return data;
};

const fetchSalaryPayments = async (): Promise<SalaryPayment[]> => {
    const { data, error } = await supabase.from('salary_payments').select('*, salaries(employee_name)').order('payment_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const SalariesManager = () => {
    const queryClient = useQueryClient();
    const [showSalaryForm, setShowSalaryForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
    const [salaryToDelete, setSalaryToDelete] = useState<Salary | null>(null);

    const { data: salaries, isLoading: isLoadingSalaries } = useQuery<Salary[]>({ queryKey: ['salaries'], queryFn: fetchSalaries });
    const { data: payments, isLoading: isLoadingPayments } = useQuery<SalaryPayment[]>({ queryKey: ['salaryPayments'], queryFn: fetchSalaryPayments });

    const handleAddNew = () => {
        setSelectedSalary(null);
        setShowSalaryForm(true);
    };

    const handleEdit = (salary: Salary) => {
        setSelectedSalary(salary);
        setShowSalaryForm(true);
    };

    const handleLogPayment = (salary: Salary) => {
        setSelectedSalary(salary);
        setShowPaymentForm(true);
    };

    const handleDelete = (salary: Salary) => {
        setSalaryToDelete(salary);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!salaryToDelete) return;
        const { error } = await supabase.from('salaries').delete().eq('id', salaryToDelete.id);
        if (error) {
            showError(`فشل حذف الراتب: ${error.message}`);
        } else {
            showSuccess('تم حذف الراتب بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['salaries'] });
            queryClient.invalidateQueries({ queryKey: ['salaryPayments'] }); // Invalidate payments as well
        }
        setShowDeleteDialog(false);
        setSalaryToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة الرواتب</h1>
                <Button onClick={handleAddNew}><PlusCircle className="ml-2 h-4 w-4" /> إضافة موظف/راتب</Button>
            </div>

            <Card className="mb-8">
                <CardHeader><CardTitle>الرواتب المسجلة</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingSalaries ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>اسم الموظف</TableHead><TableHead>الراتب الشهري</TableHead><TableHead>الحالة</TableHead><TableHead></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {salaries?.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.employee_name}</TableCell>
                                        <TableCell>{s.salary_amount} جنيه</TableCell>
                                        <TableCell>{s.is_active ? 'نشط' : 'غير نشط'}</TableCell>
                                        <TableCell className="text-left flex justify-end items-center gap-2">
                                            <Button size="sm" onClick={() => handleLogPayment(s)}><DollarSign className="ml-2 h-4 w-4" /> تسجيل دفعة</Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(s)}><Edit className="ml-2 h-4 w-4" /> تعديل</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(s)} className="text-destructive focus:text-destructive"><Trash2 className="ml-2 h-4 w-4" /> حذف</DropdownMenuItem>
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

            <Card>
                <CardHeader><CardTitle>سجل المدفوعات</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingPayments ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>تاريخ الدفع</TableHead><TableHead>اسم الموظف</TableHead><TableHead>المبلغ المدفوع</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {payments?.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{new Date(p.payment_date).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>{p.salaries?.employee_name}</TableCell>
                                        <TableCell className="font-medium text-destructive">{p.amount_paid} جنيه</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <SalaryForm isOpen={showSalaryForm} setIsOpen={setShowSalaryForm} salary={selectedSalary} />
            <LogPaymentForm isOpen={showPaymentForm} setIsOpen={setShowPaymentForm} salary={selectedSalary} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد بالتأكيد حذف راتب "{salaryToDelete?.employee_name}"؟ سيتم حذف سجل مدفوعاته أيضًا.</AlertDialogDescription>
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

export default SalariesManager;