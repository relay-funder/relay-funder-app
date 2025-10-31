'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts';
import { useCreateCampaignUpdate } from '@/lib/hooks/useUpdates';
import { UpdateFormMedia } from './update-form-media';

interface CampaignUpdateFormProps {
  creatorAddress: string;
  campaignId?: number;
  onSuccess?: () => void;
}
const campaignUpdateFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .refine(
      (value) => value.length >= 1,
      { message: 'Title must be at least 1 character long' }
    ),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .refine(
      (value) => value.length >= 1,
      { message: 'Content must be at least 1 character long' }
    ),
  media: z.any().optional(),
});
type CampaignUpdateFormValues = z.infer<typeof campaignUpdateFormSchema>;

export function CampaignUpdateForm({
  creatorAddress,
  campaignId,
  onSuccess,
}: CampaignUpdateFormProps) {
  const { toast } = useToast();
  const { mutateAsync: createCampaignUpdate, isPending } =
    useCreateCampaignUpdate();
  const { address: userAddress } = useAuth();

  const form = useForm<CampaignUpdateFormValues>({
    resolver: zodResolver(campaignUpdateFormSchema),
    defaultValues: {
      title: '',
      content: '',
      media: [],
    },
  });

  const isOwner = userAddress === creatorAddress;

  if (!isOwner) {
    return null;
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!userAddress) {
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to post an update',
      });
      return;
    }

    try {
      if (!campaignId) {
        throw new Error('Campaign not specified');
      }

      await createCampaignUpdate({
        campaignId,
        title: values.title.trim(),
        content: values.content.trim(),
        media: values.media || [],
      });

      form.reset();
      toast({
        title: 'Success!',
        description: 'Campaign update posted successfully.',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to post update',
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Update Title"
                  className="mt-1 bg-background"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Share your campaign progress..."
                  className="mt-1 min-h-[150px] resize-none bg-background"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <UpdateFormMedia />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Posting...' : 'Post Update'}
        </Button>
      </form>
    </Form>
  );
}
