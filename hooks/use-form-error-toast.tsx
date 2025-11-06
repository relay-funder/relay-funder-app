'use client';

import { useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

export type FormErrorItem<TFieldValues extends FieldValues = FieldValues> = {
  field: keyof TFieldValues | string;
  message: string;
};

interface Options {
  // When any value in this array changes, the last error toast will dismiss.
  dismissOnChange?: ReadonlyArray<unknown>;
}

export function useFormErrorToast<
  TFieldValues extends FieldValues = FieldValues,
>(form: UseFormReturn<TFieldValues>, options?: Options) {
  const { toast } = useToast();
  const lastErrorToastRef = useRef<{ dismiss: () => void } | null>(null);

  const showFormErrors = (errors: FormErrorItem[]) => {
    if (!errors.length) return;
    const t = toast({
      title: 'Form Error',
      description: (
        <ul className="list-inside list-disc text-sm">
          {errors.map((error, idx) => (
            <li key={idx}>
              <strong>
                {error.field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </strong>
              : {error.message}
            </li>
          ))}
        </ul>
      ),
      className: 'w-auto',
      variant: 'destructive',
    });
    lastErrorToastRef.current = t;
  };

  // Dismiss on external state changes (e.g., page state/back)
  useEffect(() => {
    if (lastErrorToastRef.current) {
      lastErrorToastRef.current.dismiss();
      lastErrorToastRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options?.dismissOnChange ?? []);

  // Dismiss when any input changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (lastErrorToastRef.current) {
        lastErrorToastRef.current.dismiss();
        lastErrorToastRef.current = null;
      }
    });
    return () => {
      // react-hook-form returns a subscription with unsubscribe
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  return { showFormErrors };
}
