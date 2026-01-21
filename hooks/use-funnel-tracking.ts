'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { startFunnelSession, trackEvent } from '@/lib/analytics';

export function useFunnelTracking() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    startFunnelSession();

    if (pathname === '/') {
      trackEvent('funnel_homepage_view');
    }
  }, [pathname]);

  return {
    trackEvent,
  };
}
