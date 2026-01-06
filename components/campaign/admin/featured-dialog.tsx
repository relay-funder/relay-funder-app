'use client';

import { useState, type FormEvent } from 'react';
import type { DbCampaign } from '@/types/campaign';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
} from '@/components/ui';
import {
  useAdminToggleCampaignFeatured,
  useAdminSetCampaignFeaturedDates,
} from '@/lib/hooks/useAdminCampaigns';
import { Star } from 'lucide-react';

type Props = {
  campaign: DbCampaign;
  className?: string;
  buttonClassName?: string;
};

/**
 * CampaignAdminFeaturedDialog
 *
 * A self-contained control that shows a trigger button and a dialog to
 * feature/unfeature a campaign or schedule a featured window.
 *
 * Behavior:
 * - Trigger button text:
 *    - "set featured" when not featured
 *    - "unfeature" when featured
 * - Dialog explains exactly what will happen on save.
 * - Save button text adapts to the action:
 *    - "Feature now" / "Unfeature now" when no schedule is provided
 *    - "Save schedule" when a start/end is provided
 * - Fixes logic so that saving on a currently featured campaign with no dates
 *   actually unfeatures it (uses toggle).
 */
export function CampaignAdminFeaturedDialog({
  campaign,
  className,
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const currentlyFeatured =
    Boolean(campaign?.featuredStart) && !campaign?.featuredEnd;

  // Determine button styling based on featured state
  const buttonVariant = currentlyFeatured ? 'default' : 'ghost';
  const buttonClassNameWithState = currentlyFeatured
    ? `${buttonClassName} bg-accent text-accent-foreground hover:bg-accent/90 border-accent`
    : buttonClassName;

  // Add visual indicator for featured state
  const starColor = currentlyFeatured
    ? 'text-accent-foreground'
    : 'text-muted-foreground';

  const { mutateAsync: toggleFeatured, isPending: isTogglePending } =
    useAdminToggleCampaignFeatured();
  const { mutateAsync: setFeaturedDates, isPending: isSetPending } =
    useAdminSetCampaignFeaturedDates();

  function formatDateTimeLocal(d?: Date | string | null) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = dt.getFullYear();
    const month = pad(dt.getMonth() + 1);
    const day = pad(dt.getDate());
    const hours = pad(dt.getHours());
    const minutes = pad(dt.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const onOpen = () => {
    // Prefill with existing values so "Advanced" has context,
    // but the default (non-advanced) save uses toggle regardless of these.
    setStart(formatDateTimeLocal(campaign?.featuredStart ?? null));
    setEnd(formatDateTimeLocal(campaign?.featuredEnd ?? null));
    setShowAdvanced(false);
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!campaign?.id) return;

    const isScheduleProvided = Boolean(start || end);

    // If Advanced is hidden OR both inputs are empty, treat as a toggle
    if (!showAdvanced || !isScheduleProvided) {
      await toggleFeatured({ campaignId: campaign.id });
    } else {
      await setFeaturedDates({
        campaignId: campaign.id,
        featuredStart: start ? new Date(start).toISOString() : null,
        featuredEnd: end ? new Date(end).toISOString() : null,
      });
    }

    setOpen(false);
  };

  const triggerLabel = currentlyFeatured ? 'Unfeature' : 'Feature';

  // Determine primary action label based on intent
  const willToggle = !showAdvanced || (!start && !end);
  const primaryActionLabel = willToggle
    ? currentlyFeatured
      ? 'Unfeature now'
      : 'Feature now'
    : 'Save schedule';

  const isSaving = isTogglePending || isSetPending;

  // Dynamic dialog text clearly describing the state transition
  const baseDescriptionWhenCollapsed = currentlyFeatured
    ? 'This campaign is currently featured. Clicking "Unfeature now" will immediately stop featuring it.'
    : 'This campaign is not currently featured. Clicking "Feature now" will immediately mark it as featured.';

  const scheduleHelpText =
    'Use "Advanced" to set an optional start and/or end time. If you leave both dates empty, the action will occur immediately.';

  const descriptionWhenExpanded = `Set an optional start and/or end time. Leaving both empty will ${currentlyFeatured ? 'unfeature' : 'feature'} the campaign immediately.`;

  return (
    <div className={className}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className={buttonClassNameWithState}
            onClick={onOpen}
            variant={buttonVariant}
          >
            <Star className={`mr-2 h-4 w-4 ${starColor}`} />
            {triggerLabel}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentlyFeatured
                ? 'Update featured visibility'
                : 'Feature campaign'}
            </DialogTitle>
            <DialogDescription>
              {!showAdvanced ? (
                <>
                  {baseDescriptionWhenCollapsed} {scheduleHelpText}
                </>
              ) : (
                <>{descriptionWhenExpanded}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {currentlyFeatured
                  ? 'Current state: Featured'
                  : 'Current state: Not featured'}
              </span>
              <Button
                type="button"
                className="h-8 px-3"
                onClick={() => setShowAdvanced((v) => !v)}
                variant="secondary"
              >
                {showAdvanced ? 'Hide advanced' : 'Advanced: set schedule'}
              </Button>
            </div>

            {showAdvanced && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    End (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Only provide what you need. For example, set a start time
                  with no end to feature until you manually unfeature later.
                </p>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSaving}
              >
                {primaryActionLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CampaignAdminFeaturedDialog;
