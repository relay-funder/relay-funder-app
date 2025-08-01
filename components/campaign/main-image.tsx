import Image from 'next/image';
import { useMemo } from 'react';
export function CampaignMainImage({
  campaign,
}: {
  campaign: {
    title?: string;
    images?: { isMainImage?: boolean; imageUrl?: string }[];
  };
}) {
  const mainImage = useMemo(() => {
    if (!Array.isArray(campaign.images)) {
      return null;
    }
    return campaign.images.find((img) => img.isMainImage) || campaign.images[0];
  }, [campaign?.images]);
  const imageUrl = useMemo(
    () => mainImage?.imageUrl ?? '/images/placeholder.svg',
    [mainImage],
  );
  const alt = useMemo(
    () => campaign?.title ?? 'Illustration',
    [campaign?.title],
  );
  return (
    <div className="lg:col-span-8">
      <div className="space-y-6">
        <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
          {typeof imageUrl === 'string' && (
            <Image
              src={imageUrl}
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
