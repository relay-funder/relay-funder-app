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
import {
  MAX_FILE_SIZE_BYTES,
  FILE_SIZE_ERROR_MESSAGE,
} from '@/components/campaign/constants';

export function CampaignCreateFormMedia() {
  const form = useFormContext();
  const imageWatch = form.watch('bannerImage');
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const onReset = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      form.setValue('bannerImage', null);
      setBannerImage(null);
    },
    [form],
  );

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file && file.size > MAX_FILE_SIZE_BYTES) {
        form.setError('bannerImage', {
          message: FILE_SIZE_ERROR_MESSAGE,
        });
        form.setValue('bannerImage', null);
        event.target.value = '';
        return;
      }
      form.clearErrors('bannerImage');
      form.setValue('bannerImage', file);
    },
    [form],
  );

  useEffect(() => {
    if (!imageWatch) {
      setBannerImage(null);
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
        render={() => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Campaign Banner Image
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={onFileChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {bannerImage && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Preview
            </h3>
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
