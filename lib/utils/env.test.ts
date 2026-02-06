import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Utils', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('defaults to development when no env vars are set', async () => {
        delete process.env.NEXT_PUBLIC_APP_ENV;
        delete process.env.NEXT_PUBLIC_VERCEL_ENV;
        delete process.env.VERCEL_ENV;

        const { APP_ENV, IS_DEVELOPMENT } = await import('./env');
        expect(APP_ENV).toBe('development');
        expect(IS_DEVELOPMENT).toBe(true);
    });

    it('respects NEXT_PUBLIC_APP_ENV override', async () => {
        process.env.NEXT_PUBLIC_APP_ENV = 'staging';

        const { APP_ENV, IS_STAGING } = await import('./env');
        expect(APP_ENV).toBe('staging');
        expect(IS_STAGING).toBe(true);
    });

    it('infers production from Vercel env', async () => {
        delete process.env.NEXT_PUBLIC_APP_ENV;
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

        const { APP_ENV, IS_PRODUCTION } = await import('./env');
        expect(APP_ENV).toBe('production');
        expect(IS_PRODUCTION).toBe(true);
    });

    it('infers staging from Vercel preview', async () => {
        delete process.env.NEXT_PUBLIC_APP_ENV;
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';

        const { APP_ENV, IS_STAGING } = await import('./env');
        expect(APP_ENV).toBe('staging');
        expect(IS_STAGING).toBe(true);
    });
});
