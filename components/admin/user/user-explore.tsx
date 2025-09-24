'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { PageHeaderSearch } from '@/components/page/header-search';
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
    <PageHome
      header={
        <PageHeaderSearch
          onCreate={isAdmin ? onCreate : undefined}
          createTitle={createTitle}
          placeholder="Search Users"
          onSearchChanged={setSearchTerm}
          containerWidth="default"
        />
      }
    >
      <UserList name={searchTerm} onUserClick={handleUserClick} />
    </PageHome>
  );
}

export default UserExplore;
