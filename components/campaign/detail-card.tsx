import { ReadMoreOrLess } from '@/components/read-more-or-less';
import { PropsWithChildren } from 'react';

export function CampaignDetailCard({
  title,
  text,
  children,
}: PropsWithChildren<{
  title: string;
  text: string;
}>) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>

        <div className="max-w-none">
          <ReadMoreOrLess
            className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
            collapsedClassName="line-clamp-2"
          >
            {text}
          </ReadMoreOrLess>
        </div>
        {children}
      </div>
    </div>
  );
}
