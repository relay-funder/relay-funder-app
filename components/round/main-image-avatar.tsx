'use client';

import { useMemo, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui';

export function RoundMainImageAvatar({
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
    <Avatar className="h-12 w-12 border">
      {imageUrl ? (
        <AvatarImage
          src={
            mainImageObject ? mainImageObject : (imageUrl as unknown as string)
          }
          alt={alt}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="text-lg font-semibold">
        {alt.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
