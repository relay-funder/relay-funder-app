'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useTransition, useEffect } from 'react';
import { useRef } from 'react';
import { useCreateComment } from '@/lib/hooks/useComments';
import { DbCampaign } from '@/types/campaign';
import { useRefetchCampaign } from '@/lib/hooks/useCampaigns';

interface CommentFormProps {
  campaign: DbCampaign;
}

export function CommentForm({ campaign }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { address, authenticated } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutateAsync: createComment } = useCreateComment();
  const refetchCampaign = useRefetchCampaign(campaign.id);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);

      startTransition(async () => {
        try {
          await createComment({
            campaignId: campaign.id,
            content: formData.get('content')?.toString() ?? '',
          });
          refetchCampaign();

          formRef.current?.reset();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error instanceof Error ? error.message : 'Failed to post comment',
          });
        }
      });
    },
    [toast, refetchCampaign, createComment, campaign],
  );
  if (campaign.creatorAddress === address) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Your Campaign Comments
        </h2>
        <p className="text-muted-foreground">
          {campaign._count?.comments}{' '}
          {campaign._count?.comments === 1 ? 'Comment' : 'Comments'} entered by
          users for your Campaign.
        </p>
      </div>
    );
  }
  if (!authenticated) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Your need to be signed in to comment.
        </h2>
      </div>
    );
  }
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="rounded-lg bg-card p-4 shadow">
        <textarea
          name="content"
          ref={textareaRef}
          className="w-full rounded-md border border-border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Write a comment..."
          rows={4}
          required
        />
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
