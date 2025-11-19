'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button } from '@/components/ui';
import { Heart, MapPin, Target } from 'lucide-react';
import { Category } from '@/components/shared/category';
import { useUpdateFavourite } from '@/lib/hooks/useFavourites';
import { useToast } from '@/hooks/use-toast';
import { FavoriteConfirmModal } from './favorite-confirm-modal';
import type { Favourite } from '@/types';

interface FavoriteCardProps {
  favourite: Favourite;
  onRemoved?: (campaignId: number) => void;
}

export function FavoriteCard({ favourite, onRemoved }: FavoriteCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { campaign } = favourite;
  const { mutateAsync: updateFavourite, isPending } = useUpdateFavourite();
  const { toast } = useToast();

  // Get main image from either media or images
  const getMainImage = () => {
    // Try media first (newer format)
    if (campaign.media && campaign.media.length > 0) {
      const imageMedia = campaign.media.find((m) =>
        m.mimeType?.startsWith('image'),
      );
      if (imageMedia) return imageMedia.url;
    }

    // Fallback to legacy images
    if (campaign.images && campaign.images.length > 0) {
      const mainImage =
        campaign.images.find((img) => img.isMainImage) || campaign.images[0];
      return mainImage?.imageUrl;
    }

    return null;
  };

  const mainImage = getMainImage();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Always show confirmation for removal since this is the favorites list
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    try {
      await updateFavourite({ campaignId: campaign.id });
      setShowConfirmModal(false);
      onRemoved?.(campaign.id);
      toast({
        title: 'Success',
        description: 'Campaign removed from favorites',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="overflow-hidden bg-card transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <Link href={`/campaigns/${campaign.slug}`} className="block">
            <div className="flex gap-3">
              {/* Campaign Image */}
              <div className="shrink-0">
                {mainImage ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <Image
                      src={mainImage as string}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Campaign Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
                    {campaign.title}
                  </h3>

                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 shrink-0 p-1 hover:bg-destructive/10"
                    onClick={handleFavoriteClick}
                    disabled={isPending}
                    title="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>

                {/* Category and Location */}
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <Category categoryId={campaign.category} />
                  {campaign.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{campaign.location}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                {campaign.status === 'COMPLETED' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      Completed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <FavoriteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRemove}
        campaignTitle={campaign.title}
        isLoading={isPending}
      />
    </>
  );
}
