'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';

interface HowMatchingWorksDialogProps {
  children: React.ReactNode;
}

export function HowMatchingWorksDialog({
  children,
}: HowMatchingWorksDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            How Matching Works
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm leading-relaxed">
            Your donation gets matched with extra funds from the community pool.
            The more people who donate, the bigger the total match for everyone.
          </p>

          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <h3 className="text-sm font-semibold">Why it changes:</h3>
            <ul className="space-y-2">
              <li className="flex gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Estimates go down as more projects join
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  More donors to this campaign = higher match
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Many small donations beat few large ones
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Final amount locked when round ends
                </span>
              </li>
            </ul>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            The system rewards campaigns with broad community support, not just
            big donations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
