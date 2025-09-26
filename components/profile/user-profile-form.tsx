'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, User, Globe } from 'lucide-react';
import { useUpdateUserProfile } from '@/lib/hooks/useProfile';
import { type Profile } from '@/types/profile';
import { debugComponentData as debug } from '@/lib/debug';

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'First Name must be at least 2 characters.',
    })
    .optional(),
  lastName: z
    .string()
    .min(2, {
      message: 'Last Name must be at least 2 characters.',
    })
    .optional(),
  email: z
    .string()
    .email({
      message: 'Please enter a valid email address.',
    })
    .optional()
    .or(z.literal('')),
  uniqueUsername: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username cannot be longer than 30 characters.',
    }),
  avatarUrl: z
    .string()
    .url({
      message: 'Please enter a valid URL.',
    })
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(200, {
      message: 'Bio cannot be longer than 200 characters.',
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileFormProps {
  profile?: Profile;
  onSuccess?: () => void;
}

export function UserProfileForm({ profile, onSuccess }: UserProfileFormProps) {
  const { toast } = useToast();
  const { mutateAsync: updateUserProfile, isPending } = useUpdateUserProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      uniqueUsername: profile?.username ?? '',

      bio: profile?.bio ?? '',
    },
  });

  // You can also log after setting up the form
  debug && console.log('Form values:', form.getValues());

  const onSubmit = useCallback(
    async (data: ProfileFormValues) => {
      try {
        await updateUserProfile({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          username: data.uniqueUsername,
          bio: data.bio,
        });
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
        });
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update profile. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [updateUserProfile, toast, onSuccess],
  );

  return (
    <Card className="rounded-lg border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your profile information and contact details. This information
          will be used for donations and platform interactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your first name as it will appear on the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your last name as it will appear on the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address for donation receipts and important
                      updates. We won&apos;t spam you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uniqueUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="your_unique_username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your unique identifier on the platform. This cannot be
                      changed later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tell us about yourself..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short biography to share with the community (max 200
                      characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
