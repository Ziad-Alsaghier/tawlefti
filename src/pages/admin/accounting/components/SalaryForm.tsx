import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Salary } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  employee_name: z.string().min(2, { message: "اسم الموظف يجب أن لا يقل عن حرفين." }),
  salary_amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "مبلغ الراتب يجب أن يكون رقمًا موجبًا." })
  ),
  is_active: z.boolean().default(true),
});

interface SalaryFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  salary: Salary | null; // Null for add, Salary object for edit
}

const SalaryForm = ({ isOpen, setIsOpen, salary }: SalaryFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_name: '',
      salary_amount: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen && salary) {
      form.reset({
        employee_name: salary.employee_name,
        salary_amount: salary.salary_amount,
        is_active: salary.is_active,
      });
    } else if (isOpen && !salary) {
      form.reset({
        employee_name: '',
        salary_amount: 0,
        is_active: true,
      });
    }
  }, [isOpen, salary, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (salary) {
        // Edit existing salary
        const { error } = await supabase
          .from('salaries')
          .update({
            employee_name: values.employee_name,
            salary_amount: values.salary_amount,
            is_active: values.is_active,
          })
          .eq('id', salary.id);

        if (error) throw error;
        showSuccess('تم تحديث الراتب بنجاح.');
      } else {
        // Add new salary
        const { error } = await supabase
          .from('salaries')
          .insert({
            employee_name: values.employee_name,
            salary_amount: values.salary_amount,
            is_active: values.is_active,
          });

        if (error) throw error;
        showSuccess('تم إضافة الراتب بنجاح.');
      }
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      setIsOpen(false);
    } catch (error: any) {
      showError(`فشل العملية: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{salary ? 'تعديل راتب موظف' : 'إضافة راتب موظف جديد'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الموظف</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أحمد محمد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ الراتب الشهري</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="مثال: 5000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>نشط</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'حفظ'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryForm;