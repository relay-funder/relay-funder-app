import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBaseUrl } from './metadata';

describe('getBaseUrl', () => {
  beforeEach(() => {
    // Start each test from a clean, deterministic env. Clearing the URL-related
    // vars (rather than copying from a live process.env reference) prevents one
    // test's stubbed value — e.g. VERCEL_URL — from leaking into the next.
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_ENVIRONMENT', '');
  });

  afterEach(() => {
    // Remove all env stubs so nothing carries over between tests.
    vi.unstubAllEnvs();
  });

  it('should return Vercel URL when VERCEL_URL is set', () => {
    vi.stubEnv('VERCEL_URL', 'my-app.vercel.app');
    expect(getBaseUrl()).toBe('https://my-app.vercel.app');
  });

  it('should return explicit site URL when NEXT_PUBLIC_SITE_URL is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://custom-domain.com');
    expect(getBaseUrl()).toBe('https://custom-domain.com');
  });

  it('should return production URL when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(getBaseUrl()).toBe('https://app.relayfunder.com');
  });

  it('should return staging URL when NEXT_PUBLIC_ENVIRONMENT is staging', () => {
    vi.stubEnv('NEXT_PUBLIC_ENVIRONMENT', 'staging');
    expect(getBaseUrl()).toBe('https://staging.app.relayfunder.com');
  });

  it('should return localhost for development by default', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('should prioritize VERCEL_URL over other environment variables', () => {
    vi.stubEnv('VERCEL_URL', 'vercel-app.vercel.app');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://custom-domain.com');
    vi.stubEnv('NODE_ENV', 'production');

    expect(getBaseUrl()).toBe('https://vercel-app.vercel.app');
  });

  it('should prioritize NEXT_PUBLIC_SITE_URL over NODE_ENV', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://custom-domain.com');
    vi.stubEnv('NODE_ENV', 'production');

    expect(getBaseUrl()).toBe('https://custom-domain.com');
  });
});
