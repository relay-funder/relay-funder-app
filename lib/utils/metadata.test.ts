import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBaseUrl } from './metadata';

describe('getBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.stubEnv('NODE_ENV', originalEnv.NODE_ENV);
    vi.stubEnv('VERCEL_URL', originalEnv.VERCEL_URL);
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', originalEnv.NEXT_PUBLIC_SITE_URL);
    vi.stubEnv('NEXT_PUBLIC_ENVIRONMENT', originalEnv.NEXT_PUBLIC_ENVIRONMENT);
  });

  afterEach(() => {
    // Restore original environment after each test
    vi.restoreAllMocks();
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
