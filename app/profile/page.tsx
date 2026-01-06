'use client';

import { useAuth } from '@/contexts';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { ProfileCard } from '@/components/profile/card';
import { UserScoreCard } from '@/components/profile/user-score-card';
import { ProfileAdditionalSettings } from '@/components/profile/additional-settings';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ProfilePageSkeleton } from '@/components/profile/page-skeleton';
import { useCallback, useState } from 'react';
import { PageHeader } from '@/components/page/header';
import { PageHome } from '@/components/page/home';
import { DetailContainer } from '@/components/layout';
import { useMetaTitle } from '@/hooks/use-meta-title';

export default function ProfilePage() {
  const [editProfile, setEditProfile] = useState(false);
  const { authenticated, isReady } = useAuth();
  const { data: profile, isPending: isProfilePending } = useUserProfile();
  const onEditProfile = useCallback(() => {
    setEditProfile((prevState) => !prevState);
  }, [setEditProfile]);
  const onEditSuccess = useCallback(() => {
    setEditProfile(false);
  }, [setEditProfile]);

  // Set page title for browser history
  useMetaTitle(
    editProfile
      ? 'Edit Profile | Relay Funder'
      : 'Profile Settings | Relay Funder',
  );

  if (!isReady || (authenticated && isProfilePending)) {
    return <ProfilePageSkeleton />;
  }
  if (!authenticated) {
    return (
      <PageConnectWallet>
        Please connect your wallet to access your profile
      </PageConnectWallet>
    );
  }

  return (
    <PageHome header={<PageHeader />}>
      <DetailContainer variant="wide" padding="md">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and account preferences.
            </p>
          </div>

          {/* User Profile Card */}
          <ProfileCard profile={profile} onEdit={onEditProfile} />

          {/* User Score Card */}
          <UserScoreCard />

          {/* User Profile Form */}
          {(editProfile || !profile) && (
            <UserProfileForm profile={profile} onSuccess={onEditSuccess} />
          )}

          {/* Additional Settings Card */}
          {profile && <ProfileAdditionalSettings />}
        </div>
      </DetailContainer>
    </PageHome>
  );
}
