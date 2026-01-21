'use client';

import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Media } from '@/types/campaign';
import {
  MAX_FILE_SIZE_BYTES,
  FILE_SIZE_ERROR_MESSAGE,
} from '@/components/campaign/constants';

export function UpdateFormMedia() {
  const form = useFormContext();
  const mediaWatch = form.watch('media');
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const oversizedFile = files.find(
        (file) => file.size > MAX_FILE_SIZE_BYTES,
      );
      if (oversizedFile) {
        form.setError('media', {
          message: FILE_SIZE_ERROR_MESSAGE,
        });
        form.setValue('media', []);
        event.target.value = '';
        return;
      }
      form.clearErrors('media');
      form.setValue('media', files);
    },
    [form],
  );

  const onRemove = useCallback(
    (index: number) => {
      const current: Media[] = form.getValues('media') || [];
      const newMedia = current.filter((_, i) => i !== index);
      form.setValue('media', newMedia);
    },
    [form],
  );

  useEffect(() => {
    if (!mediaWatch || !Array.isArray(mediaWatch) || mediaWatch.length === 0) {
      setMediaPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const urls = mediaWatch.map((file) => URL.createObjectURL(file));
    setMediaPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaWatch]);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="media"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-foreground">
              Media (Images)
            </FormLabel>
            <FormControl>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="mt-1"
                onChange={onFileChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {mediaPreviews.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Preview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {mediaPreviews.map((url, index) => (
                <div key={index} className="relative h-32 w-full">
                  <Image
                    src={url}
                    alt={`Media preview ${index + 1}`}
                    fill
                    className="rounded-lg object-contain shadow-sm"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                    onClick={() => onRemove(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
