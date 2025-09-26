'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Mail, Shield } from 'lucide-react';

interface EmailCaptureProps {
  onComplete: (email: string) => void;
  onSkip?: () => void;
  required?: boolean;
}

export function EmailCapture({
  onComplete,
  onSkip,
  required = false,
}: EmailCaptureProps) {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with existing profile data
  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '');
    }
  }, [profile]);

  // If user already has email and it's not required to update, complete immediately
  useEffect(() => {
    if (profile?.email && !required) {
      onComplete(profile.email);
    }
  }, [profile, required, onComplete]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update profile with email
      await updateProfile.mutateAsync({
        email,
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        recipientWallet: profile?.recipientWallet || '',
      });

      onComplete(email);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has email and we're not forcing an update, don't show the form
  if (profile?.email && !required) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription>
          {profile?.email
            ? 'Update your contact information for this donation.'
            : 'We need your email to send you donation updates and receipts.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Privacy message */}
            <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>
                We won&apos;t spam you and the email won&apos;t be publicly
                visible. Your email will only be used for donation receipts and
                important campaign updates.
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : 'Continue with Donation'}
            </Button>
            {!required && onSkip && (
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
