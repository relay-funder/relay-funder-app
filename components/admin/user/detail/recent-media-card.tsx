'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import type { MediaLite } from '@/lib/api/types';

export interface RecentMediaCardProps {
  media: MediaLite[];
  className?: string;
  title?: string;
}

export function RecentMediaCard({
  media,
  className,
  title = 'Recent Media',
}: RecentMediaCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <div className="text-sm text-muted-foreground">No media</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {media.map((m) => (
              <div key={m.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{m.mimeType}</div>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700"
                  >
                    {m.state}
                  </Badge>
                </div>
                <div
                  className="truncate text-xs text-muted-foreground"
                  title={m.url}
                >
                  {m.url}
                </div>
                {m.caption && (
                  <div className="mt-1 line-clamp-2 text-xs">{m.caption}</div>
                )}
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>Campaign: {m.campaignId ?? '—'}</div>
                  <div>Round: {m.roundId ?? '—'}</div>
                  <div>Update: {m.updateId ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentMediaCard;
