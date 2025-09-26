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
import Image from 'next/image';
export function CampaignCreateFormMedia() {
  const form = useFormContext();
  const imageWatch = form.watch('bannerImage');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const onReset = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      form.setValue('bannerImage', null);
    },
    [form],
  );
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
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="bannerImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-900">
              Campaign Banner Image
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(event) =>
                  field.onChange(event.target.files && event.target.files[0])
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {bannerImage && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Preview</h3>
            <div className="flex justify-center">
              <Image
                src={bannerImage}
                alt="Campaign banner preview"
                className="max-h-64 rounded-lg shadow-sm"
                width={400}
                height={256}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={onReset}>
                Remove Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
