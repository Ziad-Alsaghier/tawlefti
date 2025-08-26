import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Blend, CoffeeType, Additive } from '@/types/supabase';
import { coffeeMethods, getMethodById } from '@/data/coffeeData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { fetchCoffeeTypes } from '@/queries/coffee';
import { fetchBlendComposition } from '@/queries/blends';
import { fetchAdditives } from '@/queries/additives';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { calculateBlendPrice } from '@/lib/pricing';
import { fetchMethodStatuses } from '@/queries/admin';
import { fetchStoreSettings } from '@/queries/store';

type RoastLevel = 'light' | 'medium' | 'dark';

const blendCompositionSchema = z.object({
    coffee_type_code: z.string().min(1, "يجب اختيار نوع البن"),
    percentage: z.coerce.number().min(1, "النسبة يجب أن تكون 1% على الأقل").max(100, "النسبة لا يمكن أن تتجاوز 100%"),
});

const blendSchema = z.object({
    name_ar: z.string().min(3, "الاسم العربي مطلوب (3 أحرف على الأقل)"),
    name_en: z.string().min(3, "English name is required (min 3 chars)"),
    code: z.string().min(3, "الكود مطلوب (3 أحرف على الأقل)"),
    notes_ar: z.string().optional(),
    notes_en: z.string().optional(),
    preparation_notes_ar: z.string().optional(),
    preparation_notes_en: z.string().optional(),
    manual_price: z.coerce.number().optional().nullable(),
    method_id: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_functional: z.boolean().optional(),
    sensory_profile: z.record(z.number().min(1).max(5)).optional(),
    composition: z.array(blendCompositionSchema).min(1, "يجب إضافة مكون واحد على الأقل.").refine(
        (items) => {
            const total = items.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
            return total === 100;
        },
        {
            message: "مجموع النسب يجب أن يكون 100%",
        }
    ),
}).refine(data => {
    if (!data.is_functional) {
        return !!data.method_id;
    }
    return true;
}, {
    message: "طريقة التحضير مطلوبة للتوليفات غير الوظيفية",
    path: ["method_id"],
});

type BlendFormData = z.infer<typeof blendSchema>;

interface BlendFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    blend: Blend | null;
}

const BlendForm = ({ isOpen, setIsOpen, blend }: BlendFormProps) => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<BlendFormData>({
        resolver: zodResolver(blendSchema),
        defaultValues: { is_active: true, is_functional: false, composition: [] },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "composition",
    });

    const { data: coffeeTypes, isLoading: isLoadingCoffeeTypes } = useQuery({
        queryKey: ['allCoffeeTypesForForm'],
        queryFn: fetchCoffeeTypes,
    });

    const { data: allAdditives, isLoading: isLoadingAdditives } = useQuery<Additive[]>({
        queryKey: ['allAdditives'],
        queryFn: fetchAdditives,
        enabled: isOpen,
    });

    const { data: existingComposition, isLoading: isLoadingComposition } = useQuery({
        queryKey: ['blendComposition', blend?.code],
        queryFn: () => fetchBlendComposition(blend!.code),
        enabled: !!blend?.code && isOpen,
    });

    const { data: methodStatuses, isLoading: isLoadingMethodStatuses } = useQuery({
        queryKey: ['methodStatuses'],
        queryFn: fetchMethodStatuses,
    });

    const { data: storeSettings, isLoading: isLoadingStoreSettings } = useQuery({
        queryKey: ['storeSettings'],
        queryFn: fetchStoreSettings,
    });
    
    const isFunctional = form.watch('is_functional');
    const selectedMethodId = form.watch('method_id');
    const compositionValues = form.watch('composition');
    const totalPercentage = useMemo(() => {
        if (!compositionValues) return 0;
        return compositionValues.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
    }, [compositionValues]);

    // States for preview calculation
    const [previewRoast, setPreviewRoast] = useState<RoastLevel>('medium');
    const [previewWeight, setPreviewWeight] = useState('250');
    const [previewAdditives, setPreviewAdditives] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (blend) {
                form.reset({
                    ...blend,
                    notes_ar: blend.notes_ar || '',
                    notes_en: blend.notes_en || '',
                    preparation_notes_ar: blend.preparation_notes_ar || '',
                    preparation_notes_en: blend.preparation_notes_en || '',
                    manual_price: blend.manual_price || null,
                    sensory_profile: (blend.sensory_profile as Record<string, number>) || {},
                    is_functional: blend.display_category === 'وظيفية',
                    composition: [],
                });
            } else {
                form.reset({
                    name_ar: '',
                    name_en: '',
                    code: '',
                    notes_ar: '',
                    notes_en: '',
                    preparation_notes_ar: '',
                    preparation_notes_en: '',
                    manual_price: null,
                    method_id: undefined,
                    is_active: true,
                    is_functional: false,
                    sensory_profile: {},
                    composition: [],
                });
            }
            // Reset preview states
            setPreviewRoast('medium');
            setPreviewWeight('250');
            setPreviewAdditives([]);
        }
    }, [blend, isOpen, form.reset]);

    useEffect(() => {
        if (isOpen && blend && !isLoadingComposition && existingComposition) {
            form.setValue('composition', existingComposition, { shouldValidate: true });
        }
    }, [isOpen, blend, isLoadingComposition, existingComposition, form.setValue]);


    const allMethods = useMemo(() => {
        return coffeeMethods.flatMap(method => 
            method.subMethods ? method.subMethods : [method]
        );
    }, []);

    const selectedMethodSensoryScales = useMemo(() => {
        if (!selectedMethodId || isFunctional) return [];
        const method = getMethodById(selectedMethodId);
        return method?.sensoryScales || [];
    }, [selectedMethodId, isFunctional]);

    const methodProfitMargin = useMemo(() => {
        if (!methodStatuses || !selectedMethodId) return 1.4; // Default profit margin
        const status = methodStatuses.find(s => s.method_id === selectedMethodId);
        return status?.profit_margin ?? 1.4;
    }, [methodStatuses, selectedMethodId]);

    const {
        totalCoffeeCost,
        totalAdditivesCost,
        totalFixedCosts,
        cogs,
        finalPrice,
        grossProfit,
        coffeeComponentBreakdown
    } = useMemo(() => {
        const currentBlendData = form.getValues();
        const currentComposition = currentBlendData.composition;
        const currentMethodId = currentBlendData.method_id;

        return calculateBlendPrice({
            blend: { ...currentBlendData, method_id: currentMethodId, display_category: isFunctional ? 'وظيفية' : null } as Blend,
            composition: currentComposition,
            coffeePrices: coffeeTypes?.reduce((acc, ct) => ({ ...acc, [ct.code]: ct }), {} as Record<string, CoffeeType>),
            additives: allAdditives,
            roast: previewRoast,
            weight: previewWeight,
            selectedAdditiveIds: previewAdditives,
            methodProfitMargin: methodProfitMargin,
            fixedCosts: storeSettings?.fixed_costs,
        });
    }, [
        compositionValues,
        coffeeTypes,
        allAdditives,
        previewRoast,
        previewWeight,
        previewAdditives,
        methodProfitMargin,
        storeSettings,
        isFunctional
    ]);

    const onSubmit = async (data: BlendFormData) => {
        setIsLoading(true);
        const { composition, is_functional, ...restOfData } = data;
        
        const blendData = {
            ...restOfData,
            display_category: is_functional ? 'وظيفية' : null,
            method_id: is_functional ? null : restOfData.method_id,
            available_additive_ids: null,
        };

        try {
            const { error: blendError } = await supabase.from('blends').upsert(blendData, { onConflict: 'code' });
            if (blendError) throw blendError;

            const blendCode = blendData.code;

            const { error: deleteError } = await supabase.from('blend_compositions').delete().eq('blend_code', blendCode);
            if (deleteError) throw deleteError;

            const compositionToInsert = composition.map(c => ({ ...c, blend_code: blendCode }));
            const { error: insertError } = await supabase.from('blend_compositions').insert(compositionToInsert);
            if (insertError) throw insertError;

            showSuccess(`تم ${blend ? 'تحديث' : 'إنشاء'} التوليفة بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['blends'] });
            queryClient.invalidateQueries({ queryKey: ['functionalBlends'] });
            setIsOpen(false);
        } catch (error: any)
        {
            showError(`حدث خطأ: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[625px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{blend ? 'تعديل التوليفة' : 'إضافة توليفة جديدة'}</DialogTitle>
                    <DialogDescription>املأ التفاصيل أدناه لحفظ التوليفة.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <FormField control={form.control} name="is_functional" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-amber-500/10">
                                <div className="space-y-0.5">
                                    <FormLabel>توليفة على المزاج</FormLabel>
                                    <FormDescription>عند تفعيل هذا الخيار، ستظهر التوليفة في قسم خاص بالصفحة الرئيسية ولن تكون مرتبطة بطريقة تحضير معينة.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />

                        <FormField name="name_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="name_en" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (إنجليزي)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="code" control={form.control} render={({ field }) => <FormItem><FormLabel>الكود</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        
                        {!isFunctional && (
                            <FormField control={form.control} name="method_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>طريقة التحضير</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="اختر طريقة التحضير" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {allMethods.map(m => <SelectItem key={m.id} value={m.id}>{m.name.ar}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <Separator />
                        
                        <FormField name="notes_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>إيحاءات النكهة (عربي)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="notes_en" control={form.control} render={({ field }) => <FormItem><FormLabel>Flavor Notes (English)</FormLabel><FormControl><Textarea dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        
                        <FormField name="preparation_notes_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>ملاحظات التحضير (عربي)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="preparation_notes_en" control={form.control} render={({ field }) => <FormItem><FormLabel>Preparation Notes (English)</FormLabel><FormControl><Textarea dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />

                        <FormField name="manual_price" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>السعر اليدوي (اختياري)</FormLabel>
                                <FormControl><Input type="number" placeholder="اتركه فارغًا للسعر التلقائي" {...field} value={field.value ?? ''} /></FormControl>
                                <FormDescription>هذا السعر خاص بوزن 250 جرام. سيتم تعديله تلقائيًا للأوزان الأخرى. اتركه فارغًا للسعر التلقائي.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Separator />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">مكونات التوليفة</h3>
                                <div className={cn("font-bold text-sm", totalPercentage !== 100 ? "text-destructive" : "text-green-600")}>
                                    المجموع: {totalPercentage}%
                                </div>
                            </div>
                            <div className="space-y-3 rounded-md border p-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-end gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`composition.${index}.coffee_type_code`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>نوع البن</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {isLoadingCoffeeTypes ? <SelectItem value="loading" disabled>جاري التحميل...</SelectItem> : coffeeTypes?.map(ct => <SelectItem key={ct.code} value={ct.code}>{ct.name_ar}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`composition.${index}.percentage`}
                                            render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel>النسبة %</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ coffee_type_code: '', percentage: 0 })}>
                                    <PlusCircle className="ml-2 h-4 w-4" />
                                    إضافة مكون
                                </Button>
                                <FormField
                                    control={form.control}
                                    name="composition"
                                    render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>}
                                />
                            </div>
                        </div>

                        {selectedMethodSensoryScales.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-medium">المقاييس الحسية</h3>
                                {selectedMethodSensoryScales.map(scale => (
                                    <FormField
                                        key={scale.id}
                                        control={form.control}
                                        name={`sensory_profile.${scale.id}`}
                                        defaultValue={3}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{scale.name.ar}</FormLabel>
                                                <div className="flex items-center gap-4">
                                                    <FormControl>
                                                        <Slider min={1} max={5} step={1} defaultValue={[field.value || 3]} onValueChange={(val) => field.onChange(val[0])} />
                                                    </FormControl>
                                                    <span className="font-bold text-primary w-4 text-center">{field.value || 3}</span>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Cost and Profit Analysis Section */}
                        <Separator />
                        <h3 className="font-medium mb-4">تحليل التكلفة والربح (للمعاينة)</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            هذا التحليل يعتمد على الإعدادات الحالية للمتجر وأسعار البن والتحويجات.
                            يمكنك تغيير درجة التحميص والوزن والتحويجات لمعاينة تأثيرها على السعر.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Roast Level Selector */}
                            <div>
                                <FormLabel className="text-base font-medium mb-2 block">درجة التحميص (للمعاينة)</FormLabel>
                                <RadioGroup value={previewRoast} onValueChange={setPreviewRoast} className="flex gap-2">
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="light" className="sr-only" />
                                        <Button variant={previewRoast === 'light' ? 'default' : 'outline'} className="w-full">فاتح</Button>
                                    </FormLabel>
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="medium" className="sr-only" />
                                        <Button variant={previewRoast === 'medium' ? 'default' : 'outline'} className="w-full">وسط</Button>
                                    </FormLabel>
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="dark" className="sr-only" />
                                        <Button variant={previewRoast === 'dark' ? 'default' : 'outline'} className="w-full">غامق</Button>
                                    </FormLabel>
                                </RadioGroup>
                            </div>

                            {/* Weight Selector */}
                            <div>
                                <FormLabel className="text-base font-medium mb-2 block">الوزن (للمعاينة)</FormLabel>
                                <RadioGroup value={previewWeight} onValueChange={setPreviewWeight} className="flex gap-2">
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="250" className="sr-only" />
                                        <Button variant={previewWeight === '250' ? 'default' : 'outline'} className="w-full">250g</Button>
                                    </FormLabel>
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="500" className="sr-only" />
                                        <Button variant={previewWeight === '500' ? 'default' : 'outline'} className="w-full">500g</Button>
                                    </FormLabel>
                                    <FormLabel className="flex-1">
                                        <RadioGroupItem value="1000" className="sr-only" />
                                        <Button variant={previewWeight === '1000' ? 'default' : 'outline'} className="w-full">1000g</Button>
                                    </FormLabel>
                                </RadioGroup>
                            </div>
                        </div>

                        {allAdditives && allAdditives.length > 0 && (
                            <div className="mt-4">
                                <FormLabel className="text-base font-medium mb-2 block">التحويجات (للمعاينة)</FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                    {isLoadingAdditives ? <Loader2 className="animate-spin" /> : allAdditives.map((additive) => (
                                        <div key={additive.id} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={`preview-additive-${additive.id}`}
                                                checked={previewAdditives.includes(additive.id)}
                                                onCheckedChange={() => setPreviewAdditives(prev =>
                                                    prev.includes(additive.id) ? prev.filter(item => item !== additive.id) : [...prev, additive.id]
                                                )}
                                            />
                                            <label htmlFor={`preview-additive-${additive.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {additive.name_ar}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 space-y-3 text-sm">
                            <h4 className="font-semibold text-lg mb-2">تفاصيل التكلفة:</h4>
                            {isLoadingCoffeeTypes || isLoadingMethodStatuses || isLoadingStoreSettings ? (
                                <div className="flex justify-center items-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span>التكاليف الثابتة (تعبئة، طحن، أكياس):</span>
                                        <span className="font-bold">{totalFixedCosts.toFixed(2)} جنيه</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>تكلفة البن ({parseInt(previewWeight)} جرام):</span>
                                        <span className="font-bold">
                                            {compositionValues && compositionValues.length > 0 ?
                                                `${totalCoffeeCost.toFixed(2)} جنيه` :
                                                <span className="text-muted-foreground">أضف مكونات البن</span>
                                            }
                                        </span>
                                    </div>
                                    {coffeeComponentBreakdown.length > 0 && (
                                        <ul className="list-disc list-inside text-xs text-muted-foreground mr-4">
                                            {coffeeComponentBreakdown.map((comp, idx) => (
                                                <li key={idx}>{comp.name} ({comp.percentage}%): {comp.cost.toFixed(2)} جنيه</li>
                                            ))}
                                        </ul>
                                    )}
                                    {totalAdditivesCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>تكلفة التحويجات:</span>
                                            <span className="font-bold">{totalAdditivesCost.toFixed(2)} جنيه</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-base text-primary">
                                        <span>إجمالي التكلفة (COGS):</span>
                                        <span>{cogs.toFixed(2)} جنيه</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>هامش الربح المطبق:</span>
                                        <span>{methodProfitMargin.toFixed(2)}x</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg text-green-600">
                                        <span>سعر البيع النهائي:</span>
                                        <span>{finalPrice.toFixed(0)} جنيه</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-blue-600">
                                        <span>الربح الإجمالي:</span>
                                        <span>{grossProfit.toFixed(0)} جنيه</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>نشط</FormLabel><FormDescription>هل هذه التوليفة متاحة للعملاء؟</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {blend ? 'حفظ التغييرات' : 'إنشاء التوليفة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default BlendForm;