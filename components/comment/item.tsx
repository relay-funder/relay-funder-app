import { Megaphone, Trash } from 'lucide-react';
import { DbCampaign, type DbComment } from '@/types/campaign';
import { Card, CardContent, CardFooter, Button } from '@/components/ui';
import { UserInlineName } from '../user/inline-name';
import { FormattedDate } from '../formatted-date';
import { useAuth } from '@/contexts';
import { useCallback, useState } from 'react';
import { useRemoveComment, useReportComment } from '@/lib/hooks/useComments';
import { cn } from '@/lib/utils';
import { useRefetchCampaign } from '@/lib/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
export function CommentItem({
  comment,
  campaign,
}: {
  comment: DbComment;
  campaign: DbCampaign;
}) {
  const { toast } = useToast();
  const [hidden, setHidden] = useState(false);
  const { address: sessionAddress, isAdmin } = useAuth();
  const { mutateAsync: removeComment, isPending: removeIsPending } =
    useRemoveComment();
  const { mutateAsync: reportComment, isPending: reportIsPending } =
    useReportComment();
  const refetchCampaign = useRefetchCampaign(campaign.id);
  const canRemove =
    comment.creator?.address === sessionAddress ||
    campaign.creator?.address === sessionAddress ||
    isAdmin;
  const canReport = comment.creator?.address !== sessionAddress || isAdmin;
  const onRemove = useCallback(async () => {
    try {
      await removeComment({ campaignId: campaign.id, commentId: comment.id });
      refetchCampaign();
      setHidden(true);
    } catch (error) {
      console.error('Error removing comment:', error);
      toast({
        title: 'Error',
        description: `Failed remove comment: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        variant: 'destructive',
      });
    }
  }, [removeComment, refetchCampaign, campaign, comment, toast]);
  const onReport = useCallback(async () => {
    try {
      await reportComment({ campaignId: campaign.id, commentId: comment.id });
      refetchCampaign();
      setHidden(true);
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'Error',
        description: `Failed to report comment: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        variant: 'destructive',
      });
    }
  }, [reportComment, refetchCampaign, campaign, comment, toast]);
  return (
    <Card className={cn(hidden && 'hidden')}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <UserInlineName user={comment.creator} />
              <span className="text-sm text-gray-500">
                <FormattedDate date={comment.createdAt} />
              </span>
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {canRemove && (
          <Button onClick={onRemove} variant="ghost" disabled={removeIsPending}>
            <Trash />
          </Button>
        )}
        {canReport && (
          <Button onClick={onReport} variant="ghost" disabled={reportIsPending}>
            <Megaphone />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
