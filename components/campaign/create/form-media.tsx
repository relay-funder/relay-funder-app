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
export function CampaignCreateFormMedia() {
  const form = useFormContext();
  const imageWatch = form.watch('bannerImage');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const onReset = useCallback(() => {
    form.setValue('bannerImage', null);
  }, [form]);
  useEffect(() => {
    if (!imageWatch) {
      return;
    }
    if (imageWatch instanceof File) {
      const url = URL.createObjectURL(imageWatch);
      setBannerImage(url);
      return () => {
        URL.revokeObjectURL(url);
        setBannerImage(null);
      };
    }
  }, [imageWatch]);
  return (
    <>
      {bannerImage ? (
        <>
          <picture>
            <img src={bannerImage} alt="img-input" />
          </picture>
          <Button onClick={onReset}>Reset</Button>
        </>
      ) : null}
      <FormField
        control={form.control}
        name="bannerImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign Banner Image</FormLabel>
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
