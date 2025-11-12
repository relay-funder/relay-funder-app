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
    const subscription = form.watch((value) => {
      setCharCount(value[name]?.length || 0);
    });
    return () => subscription.unsubscribe();
  }, [form, name]);

  const { currentCharColor, maxCharColor, charCountColor } = useMemo(() => {
    const currentCharColor = min ? getCharMinCountColor(charCount, min) : '';
    const maxCharColor = '';
    const charCountColor = max ? getCharCountColor(charCount, max) : '';
    return { currentCharColor, maxCharColor, charCountColor };
  }, [charCount, min, max]);

  return (
    <div className={cn('flex justify-end', className)}>
      <span className={cn('text-xs', charCountColor)}>
        <span className={currentCharColor}>{charCount}</span>
        {max ? (
          <>
            /<span className={maxCharColor}>{max}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}
