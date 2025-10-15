'use client';

import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';
import { debugComponentData as debug } from '@/lib/debug';

export function CampaignMainImageCard({
  campaign,
}: {
  campaign?: {
    title?: string;
    images?: { isMainImage?: boolean; imageUrl?: string | File | null }[];
    media?: {
      id: string;
      url: string | File | null;
      caption?: string | null;
      mimeType: string;
    }[];
    mediaOrder?: string[] | null;
  };
}) {
  const [mainImageObject, setMainImageObject] = useState<string | null>(null);

  // Debug logging to help troubleshoot IPFS media loading
  useEffect(() => {
    if (campaign) {
      debug &&
        console.log('CampaignMainImageCard - Campaign data:', {
          title: campaign.title,
          hasMedia: Array.isArray(campaign.media),
          mediaCount: campaign.media?.length,
          hasMediaOrder: Array.isArray(campaign.mediaOrder),
          mediaOrderCount: campaign.mediaOrder?.length,
          hasImages: Array.isArray(campaign.images),
          imagesCount: campaign.images?.length,
          firstMediaId: campaign.media?.[0]?.id,
          firstMediaUrl: campaign.media?.[0]?.url,
          firstImageUrl: campaign.images?.[0]?.imageUrl,
        });
    }
  }, [campaign]);

  const mainImage = useMemo(() => {
    if (
      Array.isArray(campaign?.media) &&
      Array.isArray(campaign.mediaOrder) &&
      campaign.media.length &&
      campaign.mediaOrder.length
    ) {
      const firstMedia = campaign?.media
        .filter(({ mimeType }) => mimeType.startsWith('image'))
        .find(({ id }) => id === campaign.mediaOrder?.at(0));
      if (firstMedia) {
        return firstMedia;
      }
    }
    if (!Array.isArray(campaign?.images)) {
      return null;
    }
    const legacyImage =
      campaign.images.find((img) => img.isMainImage) || campaign.images[0];
    if (!legacyImage?.imageUrl) {
      return null;
    }
    return {
      id: 'none',
      url: legacyImage.imageUrl,
      caption: null,
    };
  }, [campaign?.images, campaign?.media, campaign?.mediaOrder]);
  const imageUrl = useMemo(() => {
    return mainImage?.url ?? '/images/placeholder.svg';
  }, [mainImage]);
  const alt = useMemo(() => {
    if (typeof mainImage?.caption === 'string' && mainImage.caption.length) {
      return mainImage.caption;
    }
    return campaign?.title ?? 'Illustration';
  }, [campaign?.title, mainImage]);
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
    <div className="relative aspect-video overflow-hidden rounded-t-lg">
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
    </div>
  );
}
