import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
} from '@/components/ui';
export function RoundCreateFormMedia() {
  const form = useFormContext();
  const imageWatch = form.watch('logo');
  const [logo, setLogo] = useState<string | null>(null);
  const onReset = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      form.setValue('logo', null);
    },
    [form],
  );
  useEffect(() => {
    if (!imageWatch) {
      return;
    }
    if (imageWatch instanceof File) {
      const url = URL.createObjectURL(imageWatch);
      setLogo(url);
      return () => {
        URL.revokeObjectURL(url);
        setLogo(null);
      };
    }
  }, [imageWatch]);
  return (
    <>
      {logo ? (
        <div className="flex flex-col">
          <picture className="flex justify-center">
            <img src={logo} alt="img-input" className="max-h-[50vh]" />
          </picture>
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
      ) : null}
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Round Logo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  field.onChange(event.target.files && event.target.files[0])
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
