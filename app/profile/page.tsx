'use client';

import { useAuth } from '@/contexts';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { ProfileCard } from '@/components/profile/card';
import { ProfileAdditionalSettings } from '@/components/profile/additional-settings';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { PageLoading } from '@/components/page/loading';
import { PageProfile } from '@/components/page/profile';
export default function ProfilePage() {
  const { address, authenticated, isReady } = useAuth();
  const { data: profile, isPending: isProfilePending } =
    useUserProfile(address);

  if (!isReady || isProfilePending) {
    return (
      <PageLoading>Please wait while we initialize your profile.</PageLoading>
    );
  }

  if (!authenticated) {
    return <PageConnectWallet />;
  }

  return (
    <PageProfile
      title="Profile"
      message="Manage your account settings, KYC verification, and payment methods."
    >
      <div className="grid gap-6">
        {/* User Profile Card */}
        <ProfileCard profile={profile} />

        {/* User Profile Form */}
        {profile && <UserProfileForm profile={profile} />}

        {/* Additional Settings Card */}
        <ProfileAdditionalSettings />
      </div>
    </PageProfile>
  );
}
