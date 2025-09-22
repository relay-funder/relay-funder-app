'use client';

import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';
import { debugComponentData as debug } from '@/lib/debug';

export function RoundMainImageCard({
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

  // Debug logging to help troubleshoot IPFS media loading
  useEffect(() => {
    if (!round) {
      return;
    }
    debug &&
      console.log('RoundMainImageCard - Round data:', {
        title: round.title,
        hasMedia: Array.isArray(round.media),
        mediaCount: round.media?.length,
        hasMediaOrder: Array.isArray(round.mediaOrder),
        mediaOrderCount: round.mediaOrder?.length,
        logoUrl: round.logoUrl,
        firstMediaId: round.media?.[0]?.id,
        firstMediaUrl: round.media?.[0]?.url,
      });
  }, [round]);

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
    <>
      {(typeof imageUrl === 'string' || mainImageObject !== null) && (
        <Image
          src={
            mainImageObject ? mainImageObject : (imageUrl as unknown as string)
          }
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      )}
    </>
  );
}
