import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useMemo } from 'react';
import { CampaignCreateFormStates } from './form-states';
import { DetailContainer } from '@/components/layout';

export function CampaignCreateFormPage({
  state,
  page,
  children,
  onStateChanged,
}: {
  state: keyof typeof CampaignCreateFormStates;
  page: keyof typeof CampaignCreateFormStates;
  children: React.ReactNode;
  onStateChanged?: (arg0: keyof typeof CampaignCreateFormStates) => void;
}) {
  const buttons = useMemo(() => {
    // Special handling for summary page with multiple actions
    if (state === 'summary') {
      const saveAsDraft = (
        <Button
          key="save-draft"
          variant="outline"
          size="lg"
          type="button"
          onClick={(event: React.MouseEvent) => {
            event?.preventDefault();
            // Trigger form submission with draft flag
            const form = document.querySelector('form');
            if (form) {
              (form as HTMLFormElement & { _submitType?: string })._submitType =
                'draft';
              form.requestSubmit();
            }
          }}
        >
          Save as Draft
        </Button>
      );

      const submitForApproval = (
        <Button
          key="submit-approval"
          size="lg"
          type="button"
          onClick={(event: React.MouseEvent) => {
            event?.preventDefault();
            // Trigger form submission with approval flag
            const form = document.querySelector('form');
            if (form) {
              (form as HTMLFormElement & { _submitType?: string })._submitType =
                'approval';
              form.requestSubmit();
            }
          }}
        >
          Submit for Approval
        </Button>
      );

      const prev = onStateChanged && CampaignCreateFormStates[state].prev && (
        <Button
          key="prev"
          variant="ghost"
          size="lg"
          onClick={(event: React.MouseEvent) => {
            event?.preventDefault();
            if (CampaignCreateFormStates[state].prev?.target) {
              onStateChanged(CampaignCreateFormStates[state].prev.target);
            }
          }}
        >
          {CampaignCreateFormStates[state].prev.label}
        </Button>
      );

      return [prev, saveAsDraft, submitForApproval];
    }

    // Standard navigation buttons for other pages
    const next = onStateChanged && CampaignCreateFormStates[state].next && (
      <Button key="next" size="lg" type="submit">
        {CampaignCreateFormStates[state].next.label}
      </Button>
    );
    const prev = onStateChanged && CampaignCreateFormStates[state].prev && (
      <Button
        key="prev"
        variant="secondary"
        size="lg"
        onClick={(event: React.MouseEvent) => {
          event?.preventDefault(); // prevent submit
          if (CampaignCreateFormStates[state].prev?.target) {
            onStateChanged(CampaignCreateFormStates[state].prev.target);
          }
        }}
      >
        {CampaignCreateFormStates[state].prev.label}
      </Button>
    );
    return [prev, next];
  }, [state, onStateChanged]);

  if (state !== page) {
    return null;
  }

  // Use single column layout for introduction page only
  if (page === 'introduction') {
    return (
      <DetailContainer variant="wide" padding="md">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-bold tracking-tight">
                {CampaignCreateFormStates[page].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">{children}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {buttons}
        </div>
      </DetailContainer>
    );
  }

  // Use two-column layout with guides for all other pages
  return (
    <DetailContainer variant="wide" padding="md">
      {/* Desktop: Two-column layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Form Section */}
        <div>
          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {CampaignCreateFormStates[page].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">{children}</div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div>
          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Guide & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                {CampaignCreateFormStates[page].description}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="space-y-6 lg:hidden">
        {/* Form Section */}
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {CampaignCreateFormStates[page].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">{children}</div>
          </CardContent>
        </Card>

        {/* Information Section - Always visible on mobile */}
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Guide & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground">
              {CampaignCreateFormStates[page].description}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {buttons}
      </div>
    </DetailContainer>
  );
}
