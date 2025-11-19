import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import {
  AlertCircle,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Pause,
} from 'lucide-react';
import { CampaignStatus } from '@/components/campaign/status';
import { useCampaignStatus } from '@/hooks/use-campaign-status';
import type { DbCampaign } from '@/types/campaign';

export function CampaignError({
  error,
}: {
  error: Error | string | undefined;
}) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An error occurred';
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}

export function CampaignStatusError({ campaign }: { campaign: DbCampaign }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Eye className="h-5 w-5" />;
      case 'Pending Approval':
        return <Clock className="h-5 w-5" />;
      case 'Disabled':
        return <Pause className="h-5 w-5" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'Failed':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'This campaign is currently in draft mode and not yet visible to the public.';
      case 'Pending Approval':
        return 'This campaign is awaiting approval from our team before it can go live.';
      case 'Disabled':
        return 'This campaign has been temporarily disabled by the creator.';
      case 'Completed':
        return 'This campaign has successfully reached its funding goal!';
      case 'Failed':
        return 'This campaign was unable to reach its funding goal.';
      default:
        return 'This campaign is not currently available.';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
      case 'Pending Approval':
        return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200';
      case 'Disabled':
        return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200';
      case 'Completed':
        return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200';
      case 'Failed':
        return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200';
    }
  };

  const displayStatus = useCampaignStatus(campaign);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Alert className={`${getStatusColor(displayStatus)} border-2`}>
          {getStatusIcon(displayStatus)}
          <AlertTitle className="mb-2 text-lg font-semibold">
            Campaign Status: {displayStatus}
          </AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">
            {getStatusMessage(displayStatus)}
          </AlertDescription>
        </Alert>

        {/* Show the campaign status badge for visual confirmation */}
        <div className="mt-4 flex justify-center">
          <CampaignStatus campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
