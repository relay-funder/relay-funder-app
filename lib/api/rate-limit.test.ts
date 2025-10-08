import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {
  checkIpRateLimit,
  checkUserRateLimit,
  rateLimiter,
} from './rate-limit';
import { Prisma } from '@/server/db';

vi.mock('@/lib/debug', () => ({
  debugApi: false,
}));

vi.mock('next/headers', () => {
  return {
    headers: async () => ({
      get: (key: string) => {
        if (key.toLowerCase() === 'x-forwarded-for') return '203.0.113.42';
        return undefined;
      },
    }),
  };
});

let _rows: Array<Prisma.ApiAuditCreateInput & { createdAt: Date }> = [];

vi.mock('@/server/db', () => {
  return {
    db: {
      apiAudit: {
        create: async ({ data }: { data: Prisma.ApiAuditCreateInput }) => {
          _rows.push({ ...data, createdAt: new Date() });
          return { id: _rows.length };
        },
        aggregate: async ({
          where,
        }: {
          where: {
            route: string;
            ip?: string;
            user?: string;
            createdAt?: { gte: Date };
          };
        }) => {
          const since = where.createdAt?.gte as Date | undefined;
          const rows = _rows.filter(
            (r) =>
              r.route === where.route &&
              (where.ip ? r.ip === where.ip : true) &&
              (where.user ? r.user === where.user : true) &&
              (since ? r.createdAt >= since : true),
          );
          const min = rows.length
            ? new Date(Math.min(...rows.map((r) => r.createdAt.getTime())))
            : null;
          return { _count: rows.length, _min: { createdAt: min } };
        },
      },
    },
  };
});

describe('rate-limit utility', () => {
  const ROUTE = 'routeA';
  const ONLY_USER_ROUTE = 'routeB';

  beforeEach(() => {
    _rows = [];
  });

  beforeAll(() => {
    rateLimiter.setRateLimits(ROUTE, {
      ip: { limit: 2, window: 1000 },
      user: { limit: 2, window: 1000 },
    });
    rateLimiter.setRateLimits(ONLY_USER_ROUTE, {
      user: { limit: 2, window: 1000 },
    });
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('allows and returns Infinity remaining for unknown routes', async () => {
    const r1 = await await checkIpRateLimit('new-route');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(Infinity);
  });

  it('allows and returns Infinity remaining undefined limits', async () => {
    const r1 = await await checkIpRateLimit(ONLY_USER_ROUTE);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(Infinity);
  });

  it('limits per IP within the window', async () => {
    const r1 = await checkIpRateLimit(ROUTE);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    const r2 = await await checkIpRateLimit(ROUTE);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);
    const r3 = await await checkIpRateLimit(ROUTE);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('limits per user address within the window', async () => {
    const userA1 = await checkUserRateLimit(ROUTE, 'userA');
    expect(userA1.allowed).toBe(true);
    expect(userA1.remaining).toBe(2);
    const userB1 = await checkUserRateLimit(ROUTE, 'userB');
    expect(userB1.allowed).toBe(true);
    expect(userB1.remaining).toBe(2);
    const userA2 = await checkUserRateLimit(ROUTE, 'userA');
    expect(userA2.allowed).toBe(true);
    expect(userA2.remaining).toBe(1);
    const userB2 = await checkUserRateLimit(ROUTE, 'userB');
    expect(userB2.allowed).toBe(true);
    expect(userB2.remaining).toBe(1);
    const userA3 = await checkUserRateLimit(ROUTE, 'userA');
    expect(userA3.allowed).toBe(false);
    expect(userA3.remaining).toBe(0);
    const userB3 = await checkUserRateLimit(ROUTE, 'userB');
    expect(userB3.allowed).toBe(false);
    expect(userB3.remaining).toBe(0);
  });

  it('resets per IP after the window elapses', async () => {
    const r1 = await await checkIpRateLimit(ROUTE);
    const r2 = await await checkIpRateLimit(ROUTE);
    const r3 = await await checkIpRateLimit(ROUTE);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);

    // Advance time by the window (1s set in beforeEach)
    vi.setSystemTime(Date.now() + 1001);

    const r4 = await await checkIpRateLimit(ROUTE);
    expect(r4.allowed).toBe(true);
    expect(r4.remaining).toBe(2);
  });

  it('resets per user after the window elapses', async () => {
    const u1 = await checkUserRateLimit(ROUTE, '0xAbC');
    const u2 = await checkUserRateLimit(ROUTE, '0xAbC');
    const u3 = await checkUserRateLimit(ROUTE, '0xAbC');
    expect(u1.allowed).toBe(true);
    expect(u2.allowed).toBe(true);
    expect(u3.allowed).toBe(false);

    vi.setSystemTime(Date.now() + 1001);

    const u4 = await checkUserRateLimit(ROUTE, '0xAbC');
    expect(u4.allowed).toBe(true);
    expect(u4.remaining).toBe(2);
  });
});
