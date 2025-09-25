'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/page/layout';
import { useAuth } from '@/contexts';
import UserList from './user-list';
import { GetUserResponseInstance } from '@/lib/api/types';

export type UserExploreProps = {
  onCreate?: () => void;
  createTitle?: string;
  onUserClick?: (user: GetUserResponseInstance) => void;
};

export function UserExplore({
  onCreate,
  createTitle = 'Create User',
  onUserClick,
}: UserExploreProps) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const handleUserClick =
    onUserClick ??
    ((user: GetUserResponseInstance) =>
      router.push(`/admin/users/${user.address}`));

  return (
    <PageLayout
      title="Users"
      searchPlaceholder="Search Users"
      onSearchChanged={setSearchTerm}
      onCreate={isAdmin ? onCreate : undefined}
      createTitle={createTitle}
    >
      <UserList name={searchTerm} onUserClick={handleUserClick} />
    </PageLayout>
  );
}

export default UserExplore;
