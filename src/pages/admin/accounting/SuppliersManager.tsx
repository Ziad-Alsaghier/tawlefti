import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/supabase';
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
import SupplierForm from '@/components/admin/accounting/SupplierForm';

const fetchSuppliers = async (): Promise<Supplier[]> => {
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
};

const SuppliersManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const { data: suppliers, isLoading, error } = useQuery<Supplier[]>({
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers,
    });

    const handleAddNew = () => {
        setSelectedSupplier(null);
        setShowForm(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowForm(true);
    };

    const handleDelete = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!supplierToDelete) return;
        const { error } = await supabase.from('suppliers').delete().eq('id', supplierToDelete.id);
        if (error) {
            showError(`فشل حذف المورد: ${error.message}`);
        } else {
            showSuccess('تم حذف المورد بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        }
        setShowDeleteDialog(false);
        setSupplierToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة الموردين</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مورد جديد
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الموردين</CardTitle>
                    <CardDescription>سجل بجميع موردي المواد الخام لديك.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {suppliers && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>شخص الاتصال</TableHead>
                                    <TableHead>الهاتف</TableHead>
                                    <TableHead>البريد الإلكتروني</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.contact_person || '-'}</TableCell>
                                        <TableCell dir="ltr" className="text-left">{s.phone || '-'}</TableCell>
                                        <TableCell>{s.email || '-'}</TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(s)}><Edit className="ml-2 h-4 w-4" /><span>تعديل</span></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(s)} className="text-destructive focus:text-destructive"><Trash2 className="ml-2 h-4 w-4" /><span>حذف</span></DropdownMenuItem>
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

            <SupplierForm isOpen={showForm} setIsOpen={setShowForm} supplier={selectedSupplier} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد بالتأكيد حذف المورد "{supplierToDelete?.name}"؟</AlertDialogDescription>
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

export default SuppliersManager;