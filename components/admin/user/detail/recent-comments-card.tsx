'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { CommentWithCampaignLite } from '@/lib/api/types';

export interface RecentCommentsCardProps {
  comments: CommentWithCampaignLite[];
  className?: string;
  title?: string;
}

export function RecentCommentsCard({
  comments,
  className,
  title = 'Recent Comments',
}: RecentCommentsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No comments</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-md border p-3 text-sm">
                <div className="line-clamp-3">{c.content}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  {c.campaign ? (
                    <Link
                      href={`/campaigns/${c.campaign.slug}`}
                      className="text-primary hover:underline"
                    >
                      {c.campaign.title}
                    </Link>
                  ) : (
                    <span>—</span>
                  )}
                  <span>
                    {new Date(
                      c.createdAt as unknown as string,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentCommentsCard;
