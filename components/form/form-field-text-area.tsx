import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/components/ui';
import { FormCharCounter } from './form-char-counter';

interface FormFieldTextAreaProps {
  name: string;
  label: string;
  placeholder: string;
  maxLength: number;
  minLength?: number;
}

export function FormFieldTextArea({
  label,
  maxLength,
  minLength = 0,
  name,
  placeholder,
  ...props
}: FormFieldTextAreaProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              className="mt-1 min-h-[120px] resize-none bg-background"
              placeholder={placeholder}
              maxLength={maxLength}
              {...field}
            />
          </FormControl>
          <div className="flex gap-2">
            <FormMessage className="text-xs" />
            <FormCharCounter
              name={name}
              min={minLength}
              max={maxLength}
              className="flex-1"
            />
          </div>
        </FormItem>
      )}
      {...props}
    />
  );
}
