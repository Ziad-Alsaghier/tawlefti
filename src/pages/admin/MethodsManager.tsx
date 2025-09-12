import { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { coffeeMethods, CoffeeMethod, SubMethod } from '@/data/coffeeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { MethodStatus } from '@/types/supabase';
import { Button } from '@/components/ui/button';

const fetchMethodStatuses = async (): Promise<MethodStatus[]> => {
  const { data, error } = await supabase.from('method_status').select('*');
  if (error) throw new Error(error.message);
  return data;
};

type FlatMethod = (CoffeeMethod | SubMethod) & {
  id: string;
  isSubMethod: boolean;
  parentName?: string;
};

const MethodsManager = () => {
  const queryClient = useQueryClient();
  const [localStatuses, setLocalStatuses] = useState<
    Map<string, { isActive: boolean; profitMargin: number }>
  >(new Map());

  const {
    data: methodStatuses,
    isLoading,
    error,
  } = useQuery<MethodStatus[]>({
    queryKey: ['methodStatuses'],
    queryFn: fetchMethodStatuses,
  });

  useEffect(() => {
    if (methodStatuses) {
      const newMap = new Map<
        string,
        { isActive: boolean; profitMargin: number }
      >();
      methodStatuses.forEach((s) => {
        newMap.set(s.method_id, {
          isActive: s.is_active,
          profitMargin: s.profit_margin ?? 1.4,
        });
      });
      setLocalStatuses(newMap);
    }
  }, [methodStatuses]);

  const allMethods = useMemo<FlatMethod[]>(() => {
    const methods: FlatMethod[] = [];
    for (const method of coffeeMethods) {
      methods.push({ ...method, isSubMethod: false });
      if (method.subMethods) {
        for (const subMethod of method.subMethods) {
          methods.push({
            ...subMethod,
            id: `${method.id}_${subMethod.id}`,
            isSubMethod: true,
            parentName: method.name.ar,
          });
        }
      }
    }
    return methods;
  }, []);

  const handleLocalChange = (
    methodId: string,
    field: 'isActive' | 'profitMargin',
    value: boolean | number
  ) => {
    setLocalStatuses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(methodId) ?? {
        isActive: true,
        profitMargin: 1.4,
      };
      newMap.set(methodId, { ...current, [field]: value });
      return newMap;
    });
  };

  const handleSave = async (methodId: string) => {
    const statusToSave = localStatuses.get(methodId);
    if (!statusToSave) return;

    const { error } = await supabase.from('method_status').upsert(
      {
        method_id: methodId,
        is_active: statusToSave.isActive,
        profit_margin: statusToSave.profitMargin,
      },
      { onConflict: 'method_id' }
    );

    if (error) {
      showError(`فشل تحديث الحالة: ${error.message}`);
    } else {
      showSuccess('تم تحديث الحالة بنجاح.');
      queryClient.invalidateQueries({ queryKey: ['methodStatuses'] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-center p-8">
        {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">إدارة طرق التحضير</h1>
        <p className="text-muted-foreground mt-2">
          تحكم في ظهور طرق التحضير وهامش الربح لكل منها. (مثال: 1.4 تعني ربح
          40%).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة طرق التحضير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allMethods.map((method) => {
            const currentStatus =
              localStatuses.get(method.id) ?? {
                isActive: true,
                profitMargin: 1.4,
              };
            return (
              <div
                key={method.id}
                className={`flex items-center justify-between rounded-lg border p-4 gap-4 ${
                  method.isSubMethod ? 'mr-6 bg-muted/50' : ''
                }`}
              >
                <div className="space-y-0.5 flex-grow">
                  <Label className="text-base font-medium">
                    {method.name.ar}
                    {method.isSubMethod && (
                      <span className="text-sm text-muted-foreground mr-2">
                        ({method.parentName})
                      </span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {method.description.ar}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Label
                      htmlFor={`margin-${method.id}`}
                      className="text-xs mb-1 block"
                    >
                      هامش الربح
                    </Label>
                    <Input
                      id={`margin-${method.id}`}
                      type="number"
                      step="0.05"
                      value={currentStatus.profitMargin}
                      onChange={(e) =>
                        handleLocalChange(
                          method.id,
                          'profitMargin',
                          parseFloat(e.target.value) || 1.4
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Label
                      htmlFor={`switch-${method.id}`}
                      className="text-xs"
                    >
                      الحالة
                    </Label>
                    <Switch
                      id={`switch-${method.id}`}
                      checked={currentStatus.isActive}
                      onCheckedChange={(checked) =>
                        handleLocalChange(method.id, 'isActive', checked)
                      }
                    />
                  </div>
                  <Button size="sm" onClick={() => handleSave(method.id)}>
                    حفظ
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MethodsManager;
