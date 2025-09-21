'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { FavoriteWithCampaignLite } from '@/lib/api/types';

export interface FavoritesCardProps {
  favorites: FavoriteWithCampaignLite[];
  className?: string;
  title?: string;
}

export function FavoritesCard({
  favorites,
  className,
  title = 'Favorites',
}: FavoritesCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-sm text-muted-foreground">No favorites</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {favorites.map((f) => (
              <div key={f.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  {f.campaign ? (
                    <Link
                      href={`/campaigns/${f.campaign.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {f.campaign.title}
                    </Link>
                  ) : (
                    <span>—</span>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      f.createdAt as unknown as string,
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FavoritesCard;
