import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

// Mock the shared treasury action hook
const mockExecute = vi.fn();
vi.mock('./useTreasuryAction', () => ({
  useTreasuryAction: (functionName: string) => {
    if (functionName !== 'claimTip') {
      throw new Error(`Expected claimTip but got ${functionName}`);
    }
    return {
      execute: mockExecute,
      isExecuting: false,
      error: null,
      lastTxHash: undefined,
    };
  },
}));

describe('useAdminClaimTip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('exposes claimTip function that calls execute', async () => {
    mockExecute.mockResolvedValue({ success: true, hash: '0xabc123' });
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { claimTip } = useAdminClaimTip();

    const result = await claimTip({ treasuryAddress: '0x1234567890123456789012345678901234567890' });

    expect(result.success).toBe(true);
    expect(result.hash).toBe('0xabc123');
    expect(mockExecute).toHaveBeenCalledWith({
      treasuryAddress: '0x1234567890123456789012345678901234567890',
    });
  });

  test('exposes isClaiming state', async () => {
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { isClaiming } = useAdminClaimTip();

    expect(isClaiming).toBe(false);
  });

  test('exposes error state', async () => {
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { error } = useAdminClaimTip();

    expect(error).toBe(null);
  });

  test('exposes lastTxHash state', async () => {
    const { useAdminClaimTip } = await import('./useAdminClaimTip');
    const { lastTxHash } = useAdminClaimTip();

    expect(lastTxHash).toBe(undefined);
  });
});
