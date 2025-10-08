import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';

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

describe('rate-limit utility', () => {
  beforeEach(() => {
    process.env.CAMPAIGN_CREATE_IP_WINDOW_MS = '1000';
    process.env.CAMPAIGN_CREATE_IP_LIMIT = '2';
    process.env.CAMPAIGN_CREATE_USER_WINDOW_MS = '1000';
    process.env.CAMPAIGN_CREATE_USER_LIMIT = '2';
    vi.resetModules();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('limits per IP within the window', async () => {
    const { checkIpLimit } = await import('./rate-limit'); // import after env is set
    const r1 = await checkIpLimit('campaign-create');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);
    const r2 = await checkIpLimit('campaign-create');
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);
    const r3 = await checkIpLimit('campaign-create');
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('limits per user address within the window', async () => {
    const { checkUserDailyLimit } = await import('./rate-limit'); // import after env is set
    const userA1 = checkUserDailyLimit('campaign-create', 'userA');
    expect(userA1.allowed).toBe(true);
    expect(userA1.remaining).toBe(1);
    const userB1 = checkUserDailyLimit('campaign-create', 'userB');
    expect(userB1.allowed).toBe(true);
    expect(userB1.remaining).toBe(1);
    const userA2 = checkUserDailyLimit('campaign-create', 'userA');
    expect(userA2.allowed).toBe(true);
    expect(userA2.remaining).toBe(0);
    const userB2 = checkUserDailyLimit('campaign-create', 'userB');
    expect(userB2.allowed).toBe(true);
    expect(userB2.remaining).toBe(0);
    const userA3 = checkUserDailyLimit('campaign-create', 'userA');
    expect(userA3.allowed).toBe(false);
    expect(userA3.remaining).toBe(0);
    const userB3 = checkUserDailyLimit('campaign-create', 'userB');
    expect(userB3.allowed).toBe(false);
    expect(userB3.remaining).toBe(0);
  });

  it('resets per IP after the window elapses', async () => {
    const { checkIpLimit } = await import('./rate-limit');

    const r1 = await checkIpLimit('campaign-create');
    const r2 = await checkIpLimit('campaign-create');
    const r3 = await checkIpLimit('campaign-create');
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);

    // Advance time by the window (1s set in beforeEach)
    vi.setSystemTime(Date.now() + 1001);

    const r4 = await checkIpLimit('campaign-create');
    expect(r4.allowed).toBe(true);
    expect(r4.remaining).toBe(1);
  });

  it('resets per user after the window elapses', async () => {
    const { checkUserDailyLimit } = await import('./rate-limit');

    const u1 = checkUserDailyLimit('campaign-create', '0xAbC');
    const u2 = checkUserDailyLimit('campaign-create', '0xAbC');
    const u3 = checkUserDailyLimit('campaign-create', '0xAbC');
    expect(u1.allowed).toBe(true);
    expect(u2.allowed).toBe(true);
    expect(u3.allowed).toBe(false);

    vi.setSystemTime(Date.now() + 1001);

    const u4 = checkUserDailyLimit('campaign-create', '0xAbC');
    expect(u4.allowed).toBe(true);
    expect(u4.remaining).toBe(1);
  });
});
