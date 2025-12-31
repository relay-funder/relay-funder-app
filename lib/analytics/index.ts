import { track } from '@vercel/analytics/react';
import { FunnelEvent, FunnelEventProperties } from './types';
import { getFunnelProperties } from './funnel';

export function trackEvent(
    eventName: FunnelEvent,
    properties?: FunnelEventProperties
) {
    // Merge automatic funnel properties with manual properties
    const funnelProps = getFunnelProperties();
    const finalProperties = {
        ...funnelProps,
        ...properties,
    };

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, finalProperties);
    }

    track(eventName, finalProperties);
}

export * from './types';
export * from './funnel';
