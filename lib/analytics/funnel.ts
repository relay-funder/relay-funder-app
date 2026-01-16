import { FunnelEventProperties } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
    SESSION_START: 'funnel_session_start',
    SESSION_ID: 'funnel_session_id',
};

export function startFunnelSession(): void {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)) {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, uuidv4());
        sessionStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
    }
}

export function getTimeToConvert(): number | undefined {
    if (typeof window === 'undefined') return undefined;

    const start = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!start) return undefined;

    const startTime = parseInt(start, 10);
    if (isNaN(startTime)) return undefined;

    return Math.round((Date.now() - startTime) / 1000);
}

export function getFunnelProperties(): Partial<FunnelEventProperties> {
    if (typeof window === 'undefined') return {};

    return {
        session_id: sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || undefined,
        time_to_convert: getTimeToConvert(),
        path: window.location.pathname,
        source: document.referrer || undefined,
    };
}
