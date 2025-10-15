'use client';

import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';

export function RoundMainImage({
  round,
}: {
  round?: {
    title?: string;
    logoUrl?: string | File | null;
    media?: {
      id: string;
      url: string | File | null;
      caption?: string | null;
      mimeType: string;
    }[];
    mediaOrder: string[] | null;
  };
}) {
  const [mainImageObject, setMainImageObject] = useState<string | null>(null);
  const mainImage = useMemo(() => {
    if (
      Array.isArray(round?.media) &&
      Array.isArray(round.mediaOrder) &&
      round.media.length &&
      round.mediaOrder.length
    ) {
      const firstMedia = round?.media
        .filter(({ mimeType }) => mimeType.startsWith('image'))
        .find(({ id }) => id === round.mediaOrder?.at(0));
      if (firstMedia) {
        return firstMedia;
      }
    }
    return {
      id: 'none',
      url: round?.logoUrl ?? '/images/placeholder.svg',
      caption: null,
    };
  }, [round?.logoUrl, round?.media, round?.mediaOrder]);
  const imageUrl = useMemo(() => mainImage.url, [mainImage]);
  const alt = useMemo(() => {
    if (typeof mainImage?.caption === 'string' && mainImage.caption.length) {
      return mainImage.caption;
    }
    return round?.title ?? 'Illustration';
  }, [round?.title, mainImage]);
  useEffect(() => {
    if (!imageUrl) {
      return;
    }
    if (imageUrl instanceof File) {
      const imageUrlUrl = URL.createObjectURL(imageUrl);
      setMainImageObject(imageUrlUrl);
      return () => {
        URL.revokeObjectURL(imageUrlUrl);
        setMainImageObject(null);
      };
    }
  }, [imageUrl]);
  return (
    <div className="lg:col-span-8">
      <div className="space-y-6">
        <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
          {(typeof imageUrl === 'string' || mainImageObject !== null) && (
            <Image
              src={
                mainImageObject
                  ? mainImageObject
                  : (imageUrl as unknown as string)
              }
              alt={alt}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
