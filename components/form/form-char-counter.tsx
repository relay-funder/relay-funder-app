'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  getCharCountColor,
  getCharMinCountColor,
} from '@/lib/get-char-count-color';
import { cn } from '@/lib/utils';

interface FormFieldCharCounterProps {
  name: string;
  min?: number;
  max?: number;
  className?: string;
}
export function FormCharCounter({
  name,
  min,
  max,
  className,
}: FormFieldCharCounterProps) {
  const form = useFormContext();
  const [charCount, setCharCount] = useState(0);

  // Update character counts when form values change
  useEffect(() => {
    // Set initial value
    const current = form.getValues(name)?.length || 0;
    setCharCount(current);

    // Update character counts when form values change
    const subscription = form.watch((value) => {
      const current = value[name]?.length || 0;
      setCharCount(current);
    });
    return () => subscription.unsubscribe();
  }, [form, name, min]);

  const { currentCharColor, charCountColor } = useMemo(() => {
    const currentCharColor = min ? getCharMinCountColor(charCount, min) : '';
    const charCountColor = max ? getCharCountColor(charCount, max) : '';
    return { currentCharColor, charCountColor };
  }, [charCount, min, max]);

  return (
    <div className={cn('flex justify-end', className)}>
      <span className={cn('text-xs', charCountColor)}>
        <span className={currentCharColor}>{charCount}</span>
        {max ? `/${max}` : null}
      </span>
    </div>
  );
}
