'use client';

import React from 'react';
import { useAuth } from '@/contexts';
import Authenticated from '@/components/login/authenticated';
import Login from '@/components/login';

export default function LoginPage() {
  const { authenticated } = useAuth();

  if (authenticated) {
    return <Authenticated message="Authenticated" />;
  }
  return <Login />;
}
