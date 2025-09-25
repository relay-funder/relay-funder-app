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

interface CampaignUpdateFormProps {
  creatorAddress: string;
  campaignId?: number;
  onSubmit?: (formData: FormData) => Promise<void>;
}
const campaignUpdateFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
});
type CampaignUpdateFormValues = z.infer<typeof campaignUpdateFormSchema>;

export function CampaignUpdateForm({
  creatorAddress,
  campaignId,
  onSubmit,
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
    },
  });

  const isOwner = userAddress?.toLowerCase() === creatorAddress?.toLowerCase();

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
      const payload = {
        title: values.title.trim(),
        content: values.content.trim(),
      };

      if (campaignId) {
        await createCampaignUpdate({
          campaignId,
          ...payload,
        });
      } else if (onSubmit) {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('content', payload.content);
        await onSubmit(formData);
      } else {
        throw new Error('Campaign not specified');
      }

      form.reset();
      toast({
        title: 'Success!',
        description: 'Campaign update posted successfully.',
      });
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
                  className="min-h-[150px]"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Posting...' : 'Post Update'}
        </Button>
      </form>
    </Form>
  );
}
