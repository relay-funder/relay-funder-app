import { track } from '@vercel/analytics';
import { SHOULD_LOG_ANALYTICS } from '@/lib/utils/env';
import { FunnelEvent, FunnelEventProperties } from './types';
import { getFunnelProperties } from './funnel';

export function trackEvent(
  eventName: FunnelEvent,
  properties?: FunnelEventProperties,
) {
  // Merge automatic funnel properties with manual properties
  const funnelProps = getFunnelProperties();
  const finalProperties = {
    ...funnelProps,
    ...properties,
  };

    if (SHOULD_LOG_ANALYTICS) {
        console.log(`[Analytics] ${eventName}`, finalProperties);
    }

  track(eventName, finalProperties);
}

export * from './types';
export * from './funnel';
