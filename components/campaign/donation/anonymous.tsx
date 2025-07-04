import { Checkbox } from '@/components/ui';

export function CampaignDonationAnonymous() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox id="anonymous" />
        <label htmlFor="anonymous" className="text-sm font-medium">
          Make my donation anonymous
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        By checking this, we won&apos;t consider your profile information as a
        donor for this donation and won&apos;t show it on public pages.
      </p>
    </div>
  );
}
