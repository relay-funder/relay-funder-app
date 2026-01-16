import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

// Mock the shared treasury action hook
const mockExecute = vi.fn();
vi.mock('./useTreasuryAction', () => ({
  useTreasuryAction: (functionName: string) => {
    if (functionName !== 'disburseFees') {
      throw new Error(`Expected disburseFees but got ${functionName}`);
    }
    return {
      execute: mockExecute,
      isExecuting: false,
      error: null,
      lastTxHash: undefined,
    };
  },
}));

describe('useAdminDisburseFees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('exposes disburseFees function that calls execute', async () => {
    mockExecute.mockResolvedValue({ success: true, hash: '0xdef456' });
    const { useAdminDisburseFees } = await import('./useAdminDisburseFees');
    const { disburseFees } = useAdminDisburseFees();

    const result = await disburseFees({ treasuryAddress: '0x1234567890123456789012345678901234567890' });

    expect(result.success).toBe(true);
    expect(result.hash).toBe('0xdef456');
    expect(mockExecute).toHaveBeenCalledWith({
      treasuryAddress: '0x1234567890123456789012345678901234567890',
    });
  });

  test('exposes isDisbursing state', async () => {
    const { useAdminDisburseFees } = await import('./useAdminDisburseFees');
    const { isDisbursing } = useAdminDisburseFees();

    expect(isDisbursing).toBe(false);
  });

  test('exposes error state', async () => {
    const { useAdminDisburseFees } = await import('./useAdminDisburseFees');
    const { error } = useAdminDisburseFees();

    expect(error).toBe(null);
  });

  test('exposes lastTxHash state', async () => {
    const { useAdminDisburseFees } = await import('./useAdminDisburseFees');
    const { lastTxHash } = useAdminDisburseFees();

    expect(lastTxHash).toBe(undefined);
  });
});
