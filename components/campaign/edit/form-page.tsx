import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useMemo } from 'react';
import { CampaignEditFormStates } from './form-states';
import { DetailContainer } from '@/components/layout';

export function CampaignEditFormPage({
  state,
  page,
  children,
  onStateChanged,
  isAlreadySubmitted = false,
}: {
  state: keyof typeof CampaignEditFormStates;
  page: keyof typeof CampaignEditFormStates;
  children: React.ReactNode;
  onStateChanged?: (arg0: keyof typeof CampaignEditFormStates) => void;
  isAlreadySubmitted?: boolean;
}) {
  const buttons = useMemo(() => {
    // Special handling for summary page with draft and approval actions
    if (state === 'summary') {
      // For already submitted campaigns, only show save button
      if (isAlreadySubmitted) {
        const saveButton = (
          <Button
            key="save"
            size="lg"
            type="button"
            onClick={(event: React.MouseEvent) => {
              event?.preventDefault();
              // Trigger form submission with save flag
              const form = document.querySelector('form');
              if (form) {
                (form as any)._submitType = 'save';
                form.requestSubmit();
              }
            }}
          >
            Save
          </Button>
        );

        const prev = onStateChanged && CampaignEditFormStates[state].prev && (
          <Button
            key="prev"
            variant="ghost"
            size="lg"
            onClick={(event: React.MouseEvent) => {
              event?.preventDefault();
              if (CampaignEditFormStates[state].prev?.target) {
                onStateChanged(CampaignEditFormStates[state].prev.target);
              }
            }}
          >
            {CampaignEditFormStates[state].prev.label}
          </Button>
        );

        return [prev, saveButton];
      }

      // For draft campaigns, show both save as draft and submit for approval
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
              (form as any)._submitType = 'draft';
              form.requestSubmit();
            }
          }}
        >
          Save (draft)
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
              (form as any)._submitType = 'approval';
              form.requestSubmit();
            }
          }}
        >
          Submit for approval
        </Button>
      );

      const prev = onStateChanged && CampaignEditFormStates[state].prev && (
        <Button
          key="prev"
          variant="ghost"
          size="lg"
          onClick={(event: React.MouseEvent) => {
            event?.preventDefault();
            if (CampaignEditFormStates[state].prev?.target) {
              onStateChanged(CampaignEditFormStates[state].prev.target);
            }
          }}
        >
          {CampaignEditFormStates[state].prev.label}
        </Button>
      );

      return [prev, saveAsDraft, submitForApproval];
    }

    // Standard navigation buttons for other pages
    const next = onStateChanged && CampaignEditFormStates[state].next && (
      <Button key="next" size="lg" type="submit">
        {CampaignEditFormStates[state].next.label}
      </Button>
    );
    const prev = onStateChanged && CampaignEditFormStates[state].prev && (
      <Button
        key="prev"
        variant="secondary"
        size="lg"
        onClick={(event: React.MouseEvent) => {
          event?.preventDefault(); // prevent submit
          if (CampaignEditFormStates[state].prev?.target) {
            onStateChanged(CampaignEditFormStates[state].prev.target);
          }
        }}
      >
        {CampaignEditFormStates[state].prev.label}
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
          <Card className="rounded-lg border bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-bold tracking-tight">
                {CampaignEditFormStates[page].title}
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
          <Card className="rounded-lg border bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {CampaignEditFormStates[page].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">{children}</div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div>
          <Card className="rounded-lg border bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Guide & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700">
                {CampaignEditFormStates[page].description}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="space-y-6 lg:hidden">
        {/* Form Section */}
        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {CampaignEditFormStates[page].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">{children}</div>
          </CardContent>
        </Card>

        {/* Information Section - Always visible on mobile */}
        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Guide & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700">
              {CampaignEditFormStates[page].description}
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
