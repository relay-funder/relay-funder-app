'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { countries, categories } from '@/lib/constant';
import { enableFormDefault } from '@/lib/develop';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useCreateCampaign, useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import {
  useCreateCampaignContract,
  IOnCreateCampaignConfirmed,
} from '@/lib/web3/hooks/useCreateCampaignContract';
import { useAuth } from '@/contexts';

// Utility function to decode contract errors
const decodeContractError = (error: unknown) => {
  console.log('🔍 Decoding contract error:', error);
  
  const errorObj = error as Record<string, unknown>;
  
  // Check for different error formats
  if (errorObj?.data) {
    console.log('📋 Error data found:', errorObj.data);
    
    // Extract error selector (first 4 bytes)
    if (typeof errorObj.data === 'string' && errorObj.data.length >= 10) {
      const selector = errorObj.data.slice(0, 10);
      console.log('🎯 Error selector:', selector);
      
      // Extract additional data
      if (errorObj.data.length > 10) {
        const additionalData = errorObj.data.slice(10);
        console.log('📄 Additional error data:', additionalData);
        
        // Try to extract address from the data (last 40 characters)
        if (additionalData.length >= 40) {
          const address = '0x' + additionalData.slice(-40);
          console.log('📍 Address in error data:', address);
        }
      }
    }
  }
  
  // Check for RPC error format
  const nestedError = errorObj?.error as Record<string, unknown>;
  if (nestedError?.data) {
    console.log('🌐 RPC error data:', nestedError.data);
  }
  
  // Check for reason string
  if (errorObj?.reason) {
    console.log('💬 Error reason:', errorObj.reason);
  }
  
  // Check for message
  if (errorObj?.message) {
    console.log('📝 Error message:', errorObj.message);
  }
  
  return {
    selector: typeof errorObj?.data === 'string' ? errorObj.data.slice(0, 10) : undefined,
    data: errorObj?.data,
    reason: errorObj?.reason,
    message: errorObj?.message,
    code: errorObj?.code || nestedError?.code,
  };
};

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  fundingGoal: z.string().min(1, 'Funding goal is required'),
  startTime: z.string().min(1, 'Start time is required').refine((startTime) => {
    const startDate = new Date(startTime);
    const now = new Date();
    return startDate.getTime() > now.getTime();
  }, 'Start time must be in the future'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().default(''),
  category: z.string().default(''),
  bannerImage: z.instanceof(File).optional(),
}).refine((data) => {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  return endDate.getTime() > startDate.getTime();
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
type CampaignFormValues = z.infer<typeof campaignSchema>;
const defaultValues: CampaignFormValues = {
  title: '',
  description: '',
  fundingGoal: '',
  startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hour from now
  endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16),
  location: '',
  category: '',
  bannerImage: undefined,
};
export function CampaignCreate() {
  const { authenticated } = useAuth();
  const router = useRouter();

  const { toast } = useToast();
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues,
  });
  const imageWatch = form.watch('bannerImage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [isCompleteSuccess, setIsCompleteSuccess] = useState(false);

  const { mutateAsync: createCampaign, isPending: isCreateCampaignPending } =
    useCreateCampaign();
  const { mutateAsync: updateCampaign, isPending: isUpdateCampaignPending } =
    useUpdateCampaign();

  const onConfirmed = useCallback(
    async ({
      hash,
      status,
      campaignAddress,
      event,
    }: IOnCreateCampaignConfirmed) => {
      console.log('🎉 Campaign creation confirmed:', { hash, status, campaignAddress });
      
      if (!campaignId) {
        console.error('❌ No campaignId available');
        return;
      }
      
      try {
        if (status === 'success') {
          console.log('✅ Blockchain transaction successful');
          
          // Update campaign with blockchain details
          await updateCampaign({
            campaignId,
            transactionHash: hash,
            status: 'pending_approval',
            campaignAddress,
          });
          
          if (event) {
            const eventCampaignAddress = event.address;
            if (eventCampaignAddress) {
              await updateCampaign({
                campaignId,
                campaignAddress: eventCampaignAddress,
              });
            }

            toast({
              title: 'Success!',
              description:
                'Campaign created successfully and pending approval.',
              variant: 'default',
            });
            
            setIsCompleteSuccess(true);
            
            // Redirect to dashboard after success
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            // Fallback if no event data
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          }
        } else if (status === 'failed') {
          console.error('❌ Blockchain transaction failed');
          
          const errorMessage = 'Blockchain transaction failed. This often happens when:\n' +
            '• The launch time is in the past (check your start time)\n' +
            '• The campaign identifier already exists (try again with different details)\n' +
            '• Network congestion (try again later)\n' +
            '• Invalid parameters (check your dates and funding goal)';
          
          toast({
            variant: 'destructive',
            title: 'Blockchain Transaction Failed',
            description: errorMessage,
          });
          
          // Update campaign status to failed
          try {
            await updateCampaign({
              campaignId,
              status: 'failed',
              transactionHash: hash,
            });
          } catch (updateError) {
            console.error('❌ Failed to update campaign status:', updateError);
          }
        }
      } catch (error) {
        console.error('❌ Error processing transaction confirmation:', error);
        
        // Decode contract error details for debugging
        const errorDetails = decodeContractError(error);
        
        let userMessage = 'An error occurred while processing the transaction.';
        if (errorDetails.reason) {
          userMessage = `Transaction failed: ${errorDetails.reason}`;
        } else if (typeof errorDetails.message === 'string' && errorDetails.message.includes('missing required fields')) {
          userMessage = 'Invalid campaign parameters. Please check your form inputs.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Transaction Error',
          description: userMessage,
        });
      }
    },
    [campaignId, toast, updateCampaign, router],
  );
  const {
    createCampaignContract,
    isPending,
    isConfirming,
    isSuccess,
    createCampaignContractHash,
  } = useCreateCampaignContract({ onConfirmed });

  // Also add loading state toasts
  useEffect(() => {
    if (isPending) {
      toast({
        title: 'Transaction Pending',
        description: 'Please confirm the transaction in your wallet...',
      });
    }
    if (isConfirming) {
      toast({
        title: 'Transaction Confirming',
        description: 'Waiting for blockchain confirmation...',
      });
    }
    if (isSuccess && createCampaignContractHash) {
      toast({
        title: 'Transaction Confirmed',
        description: (
          <div>
            Transaction successful!{' '}
            <a
              href={`https://alfajores.celoscan.io/tx/${createCampaignContractHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-600"
            >
              View on Explorer
            </a>
          </div>
        ),
        variant: 'default',
      });
    }
  }, [isPending, isConfirming, isSuccess, createCampaignContractHash, toast]);

  const [dbError, setDbError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (data: CampaignFormValues) => {
      console.log('🚀 Campaign creation started');
      setDbError(null);

      if (!authenticated) {
        console.error('❌ User not authenticated');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Wallet not connected or contract not available',
        });
        return;
      }

      try {
        toast({
          title: 'Creating Campaign',
          description: 'Saving campaign details to database...',
        });
        setIsSubmitting(true);
        
        // Format the data properly for the API
        const campaignData = {
          title: data.title.trim(),
          description: data.description.trim(),
          fundingGoal: data.fundingGoal.trim(),
          startTime: data.startTime,
          endTime: data.endTime,
          location: (data.location || '').trim(),
          category: (data.category || '').trim(),
          bannerImage: data.bannerImage,
        };
        
        const newCampaign = await createCampaign(campaignData);
        console.log('✅ Campaign saved to database:', newCampaign.campaignId);
        
        toast({
          title: 'Campaign Saved',
          description: 'Initiating blockchain transaction...',
        });

        const { campaignId: newCampaignId } = newCampaign;
        setCampaignId(newCampaignId);
        
        await createCampaignContract({
          startTime: data.startTime,
          endTime: data.endTime,
          fundingGoal: data.fundingGoal,
        });
        
        console.log('✅ Blockchain transaction initiated');
      } catch (error) {
        console.error('❌ Campaign creation failed:', error);
        if (error instanceof Error) {
          // Provide more user-friendly error messages
          let userMessage = error.message;
          if (error.message.includes('missing required fields')) {
            userMessage = 'Please fill in all required fields (title, description, funding goal, start time, and end time).';
          } else if (error.message.includes('invalid parameters')) {
            userMessage = 'Please check your form inputs and try again.';
          }
          
          toast({
            variant: 'destructive',
            title: 'Error',
            description: userMessage,
          });
          setDbError(userMessage);
        }
        return;
      } finally {
        setIsSubmitting(false);
      }
    },
    [authenticated, toast, createCampaign, createCampaignContract],
  );
  const onDeveloperSubmit = useCallback(async () => {
    if (!enableFormDefault) {
      return;
    }
    await onSubmit({
      title: 'Debug Campaign',
      description: 'This is a debug campaign created for testing purposes with detailed logging and error handling.',
      fundingGoal: '100',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 1 week from now
      endTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 3 weeks from now
        .toISOString()
        .slice(0, 16),
      location: 'Portugal',
      category: 'technology',
    });
  }, [onSubmit]);
  useEffect(() => {
    if (!imageWatch) {
      return;
    }
    if (imageWatch instanceof File) {
      const url = URL.createObjectURL(imageWatch);
      setBannerImage(url);
      return () => {
        URL.revokeObjectURL(url);
        setBannerImage(null);
      };
    }
  }, [imageWatch]);

  // Clear errors when success is achieved
  useEffect(() => {
    if (isCompleteSuccess) {
      setDbError(null);
    }
  }, [isCompleteSuccess]);

  const isCreating =
    isSubmitting ||
    isCreateCampaignPending ||
    isUpdateCampaignPending ||
    isPending ||
    isConfirming;
  const canCreate = Boolean(!isCreating && !isCompleteSuccess);

  // Show success message when completely done
  if (isCompleteSuccess) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-green-600">Campaign Created Successfully!</h2>
          <p className="text-gray-600">
            Your campaign has been created and is now pending admin approval.
            You&apos;ll be redirected to your dashboard shortly.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Campaign"
                    {...field}
                    onDoubleClick={onDeveloperSubmit}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description of Campaign" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {bannerImage ? (
            <picture>
              <img src={bannerImage} alt="img-input" />
            </picture>
          ) : null}
          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Banner Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      field.onChange(
                        event.target.files && event.target.files[0],
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fundingGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Goal (USDC)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={!canCreate} className="w-full">
            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isPending && <Loader2 className="animate-spin mr-2" />}
            {isConfirming && <Loader2 className="animate-spin mr-2" />}
            {isCompleteSuccess ? (
              'Campaign Created Successfully!'
            ) : isConfirming ? (
              'Confirming Transaction...'
            ) : isPending ? (
              'Waiting for Wallet...'
            ) : isSubmitting || isCreateCampaignPending || isUpdateCampaignPending ? (
              'Saving Campaign...'
            ) : (
              'Create Campaign'
            )}
          </Button>
        </form>
      </Form>
      {dbError && <div className="text-center text-red-600">{dbError}</div>}
    </div>
  );
}
