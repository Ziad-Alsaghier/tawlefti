import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseCategory } from '@/types/supabase';
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
import CategoryForm from '@/components/admin/accounting/CategoryForm';

const fetchCategories = async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase.from('expense_categories').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

const ExpenseCategoriesManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);

    const { data: categories, isLoading, error } = useQuery<ExpenseCategory[]>({
        queryKey: ['expense_categories'],
        queryFn: fetchCategories,
    });

    const handleAddNew = () => {
        setSelectedCategory(null);
        setShowForm(true);
    };

    const handleEdit = (category: ExpenseCategory) => {
        setSelectedCategory(category);
        setShowForm(true);
    };

    const handleDelete = (category: ExpenseCategory) => {
        setCategoryToDelete(category);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        const { error } = await supabase.from('expense_categories').delete().eq('id', categoryToDelete.id);
        if (error) {
            showError(`فشل حذف الفئة: ${error.message}`);
        } else {
            showSuccess('تم حذف الفئة بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
        }
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة فئات المصروفات</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة فئة جديدة
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الفئات</CardTitle>
                    <CardDescription>هنا يمكنك إضافة وتعديل فئات المصروفات لتنظيم حساباتك.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {categories && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">{cat.name_ar}</TableCell>
                                        <TableCell>{cat.description_ar}</TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(cat)}>
                                                        <Edit className="ml-2 h-4 w-4" />
                                                        <span>تعديل</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(cat)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="ml-2 h-4 w-4" />
                                                        <span>حذف</span>
                                                    </DropdownMenuItem>
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

            <CategoryForm
                isOpen={showForm}
                setIsOpen={setShowForm}
                category={selectedCategory}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل تريد بالتأكيد حذف فئة "{categoryToDelete?.name_ar}"؟
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ExpenseCategoriesManager;