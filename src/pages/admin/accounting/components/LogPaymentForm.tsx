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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess, showError } from '@/utils/toast';

const formSchema = z.object({
  payment_date: z.date({ required_error: "تاريخ الدفع مطلوب." }),
  amount_paid: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "المبلغ المدفوع يجب أن يكون رقمًا موجبًا." })
  ),
  notes: z.string().optional(),
});

interface LogPaymentFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  salary: Salary | null; // The salary for which payment is being logged
}

const LogPaymentForm = ({ isOpen, setIsOpen, salary }: LogPaymentFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_date: new Date(),
      amount_paid: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen && salary) {
      form.reset({
        payment_date: new Date(),
        amount_paid: salary.salary_amount, // Pre-fill with default salary amount
        notes: `دفعة راتب ${salary.employee_name} لشهر ${format(new Date(), 'MM/yyyy')}`,
      });
    } else if (isOpen && !salary) {
        // Reset if no salary is selected (shouldn't happen if button is disabled)
        form.reset({
            payment_date: new Date(),
            amount_paid: 0,
            notes: '',
        });
    }
  }, [isOpen, salary, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!salary) {
      showError('لم يتم تحديد الموظف لتسجيل الدفعة.');
      return;
    }

    try {
      const { error } = await supabase
        .from('salary_payments')
        .insert({
          salary_id: salary.id,
          payment_date: format(values.payment_date, 'yyyy-MM-dd'),
          amount_paid: values.amount_paid,
          notes: values.notes,
        });

      if (error) throw error;
      showSuccess('تم تسجيل دفعة الراتب بنجاح.');
      queryClient.invalidateQueries({ queryKey: ['salaryPayments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Invalidate transactions to update ledger
      setIsOpen(false);
    } catch (error: any) {
      showError(`فشل تسجيل الدفعة: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة راتب لـ {salary?.employee_name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ الدفع</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: (window as any).__localeId__ })
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ المدفوع</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="مثال: 5000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية حول الدفعة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري التسجيل...' : 'تسجيل الدفعة'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LogPaymentForm;