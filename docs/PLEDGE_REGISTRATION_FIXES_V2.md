# Pledge Registration Fixes - Version 2

## Issues Fixed

### 1. ❌ "Replacement Fee Too Low" Error (REPLACEMENT_UNDERPRICED)

**Problem:** Two concurrent pledge registrations were happening simultaneously, causing the second transaction to fail with "replacement fee too low" because it tried to use the same nonce.

**Root Cause:** 
- User may have double-clicked the donate button before it disabled
- Multiple API calls initiated before the first completed
- No protection against concurrent registrations for the same user

**Evidence from logs (lines 445-473):**
```
Line 445-452: First registration starts
Line 456-463: Second registration starts (before first completes!)
Line 464: First tx gets hash
Line 465-470: Second fails with REPLACEMENT_UNDERPRICED
Line 472-473: First succeeds
```

### 2. ❌ Donation Continued Despite Registration Failure

**Problem:** The client-side code didn't properly halt the donation flow when pledge registration failed. It continued to the approval/pledge steps even though registration failed.

**Root Cause:**
- Error handling in `request-transaction.ts` wasn't strict enough
- Error didn't properly propagate to stop the flow
- No validation that registration succeeded before continuing

## Solutions Implemented

### Backend Fixes (`app/api/pledges/register/route.ts`)

#### 1. **In-Memory Locking Mechanism**
```typescript
// Prevents concurrent registrations from the same user
const registrationLocks = new Map<string, { pledgeId: string; timestamp: number }>();

function acquireLock(userAddress: string, pledgeId: string): boolean {
  // Check for existing locks
  // Auto-cleanup expired locks (2 min timeout)
  // Acquire lock if available
}

function releaseLock(userAddress: string): void {
  // Release lock after success or failure
}
```

**Benefits:**
- ✅ Prevents duplicate transactions from same user
- ✅ Automatic lock cleanup after 2 minutes
- ✅ Clear error message when lock exists

#### 2. **Explicit Nonce Management**
```typescript
const nonce = await provider.getTransactionCount(
  adminSigner.address,
  'pending', // Use pending to get next available nonce
);

const tx = await treasuryContract.setPaymentGatewayFee(pledgeId, gatewayFee, {
  nonce, // Explicitly set nonce
  maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
  maxFeePerGas: ethers.parseUnits('100', 'gwei'),
});
```

**Benefits:**
- ✅ Ensures proper transaction ordering
- ✅ Prevents nonce conflicts
- ✅ Sets appropriate gas fees

#### 3. **Transaction Timeout Protection**
```typescript
const receipt = await Promise.race([
  tx.wait(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction timeout after 60s')), 60000),
  ),
]);
```

**Benefits:**
- ✅ Prevents hanging indefinitely
- ✅ Clear timeout error message
- ✅ User can retry if timeout occurs

#### 4. **Enhanced Error Handling**
```typescript
// Specific error code handling
if (errorCode === 'REPLACEMENT_UNDERPRICED') {
  errorMessage = 'Transaction already pending. Please wait a moment and try again.';
} else if (errorCode === 'NONCE_EXPIRED') {
  errorMessage = 'Transaction nonce conflict. Please try again.';
} else if (errorMessage.includes('timeout')) {
  errorMessage = 'Transaction confirmation timeout. Your pledge may still be processing.';
}
```

**Benefits:**
- ✅ User-friendly error messages
- ✅ Specific handling for common errors
- ✅ Actionable feedback for users

#### 5. **Lock Release in Finally Block**
```typescript
try {
  // All registration logic
  return response({ success: true, ... });
} finally {
  // Always release lock, even if error occurred
  releaseLock(userAddress);
}
```

**Benefits:**
- ✅ Lock always released, even on error
- ✅ No lock leakage
- ✅ Prevents permanent locks

### Client-Side Fixes (`lib/web3/request-transaction.ts`)

#### 1. **Enhanced Error Detection**
```typescript
if (!registerResponse.ok) {
  let errorMessage = 'Failed to register pledge with backend';
  let errorDetails = '';
  
  try {
    const errorData = await registerResponse.json();
    errorMessage = errorData.error || errorMessage;
    errorDetails = errorData.details || '';
  } catch {
    // JSON parse failed, use default
  }
  
  // Log detailed error
  console.error('Pledge registration failed:', {
    status: registerResponse.status,
    statusText: registerResponse.statusText,
    error: errorMessage,
    details: errorDetails,
  });
  
  throw new Error(errorMessage);
}
```

**Benefits:**
- ✅ Captures all error details
- ✅ Comprehensive logging for debugging
- ✅ Graceful JSON parse failure handling

#### 2. **Success Status Validation**
```typescript
registerData = await registerResponse.json();

if (!registerData.success) {
  throw new Error('Pledge registration did not return success status');
}

debug && console.log('Pledge ID registered successfully:', {
  pledgeId: registerData.pledgeId,
  transactionHash: registerData.transactionHash,
  blockNumber: registerData.blockNumber,
});
```

**Benefits:**
- ✅ Validates success before continuing
- ✅ Comprehensive success logging
- ✅ Won't proceed with invalid registration

#### 3. **User-Friendly Error Messages**
```typescript
let userMessage = 'Failed to register pledge with treasury. Please try again.';
if (registerError instanceof Error) {
  if (registerError.message.includes('pending')) {
    userMessage = 'A transaction is already pending. Please wait a moment and try again.';
  } else if (registerError.message.includes('timeout')) {
    userMessage = 'Registration timeout. Please check your connection and try again.';
  } else if (registerError.message.includes('nonce')) {
    userMessage = 'Transaction conflict detected. Please wait a moment and try again.';
  } else {
    userMessage = registerError.message;
  }
}

throw new Error(`Pledge Registration Failed: ${userMessage}`);
```

**Benefits:**
- ✅ Clear, actionable error messages
- ✅ Specific guidance for common issues
- ✅ Prefixed with "Pledge Registration Failed" for clarity

#### 4. **Complete Flow Halt on Failure**
```typescript
// This throw stops execution immediately
throw new Error(`Pledge Registration Failed: ${userMessage}`);

// Code below this will NOT execute if registration fails
const treasuryContract = new ethers.Contract(...);
// Approve USDC
// Submit pledge
```

**Benefits:**
- ✅ Immediate halt on registration failure
- ✅ No wasted user interactions
- ✅ Clear failure state displayed to user

## Testing Checklist

### Backend Testing
- [x] Single registration completes successfully
- [ ] Concurrent registrations from same user are blocked
- [ ] Lock is released after success
- [ ] Lock is released after failure
- [ ] Lock auto-expires after 2 minutes
- [ ] Transaction timeout works correctly
- [ ] Error messages are user-friendly
- [ ] Nonce management prevents conflicts

### Client Testing
- [ ] Registration failure stops donation flow
- [ ] User sees clear error message
- [ ] Can retry after registration failure
- [ ] Success status is validated
- [ ] All error details are logged
- [ ] Button stays disabled during processing

### Integration Testing
- [ ] Complete donation flow works end-to-end
- [ ] Double-click doesn't cause duplicate transactions
- [ ] Timeout recovery works
- [ ] Network failure recovery works
- [ ] Multiple users can donate simultaneously
- [ ] Sequential donations from same user work

## Monitoring Improvements

### Backend Logs to Watch
```
[pledges/register] Registering pledge: { ... }
[pledges/register] Lock acquired for: 0x...
[pledges/register] Using nonce: 123
[pledges/register] Transaction hash: 0x...
[pledges/register] Transaction confirmed in block: 6205633
[pledges/register] Lock released for: 0x...
```

### Client Logs to Watch
```
Registering pledge ID with treasury via backend...
Pledge ID registered successfully: { pledgeId, transactionHash, blockNumber }
```

### Error Logs to Watch
```
❌ Pledge registration failed: Error details
[pledges/register] Contract call failed: Error details
[pledges/register] Lock already exists: { userAddress, existingPledgeId, ... }
```

## Expected Behavior After Fixes

### Normal Flow
1. User clicks "Contribute with Wallet"
2. Button immediately disables
3. Registration state shows: "Registering Pledge"
4. Backend acquires lock for user
5. Backend gets pending nonce
6. Backend sends transaction with explicit nonce
7. Backend waits for confirmation (max 60s)
8. Backend releases lock
9. Backend returns success
10. Client validates success
11. Client proceeds to USDC approval
12. Client proceeds to pledge

### When User Double-Clicks
1. First click: Registration starts, lock acquired
2. Second click: **Blocked by backend lock**
3. User sees: "A pledge registration is already in progress"
4. First registration completes
5. Lock released
6. User can try again if needed

### When Timeout Occurs
1. Registration starts
2. Transaction sent but confirmation takes >60s
3. Backend throws timeout error
4. Lock released
5. User sees: "Registration timeout. Please check your connection and try again"
6. User can retry

### When Nonce Conflict Occurs
1. Registration starts
2. Backend detects REPLACEMENT_UNDERPRICED
3. Returns user-friendly error
4. Lock released
5. User sees: "Transaction already pending. Please wait a moment and try again"
6. User waits a moment and retries successfully

## Performance Impact

### Added Latency
- **Lock check**: <1ms (in-memory map lookup)
- **Nonce fetch**: ~100-500ms (RPC call)
- **Gas price specification**: 0ms (no additional calls)
- **Total impact**: Minimal, mostly from nonce fetch which is necessary

### Memory Usage
- **Lock storage**: ~100 bytes per user
- **Auto-cleanup**: Every request cleans expired locks
- **Peak usage**: Negligible (hundreds of concurrent users = few KB)

## Security Considerations

### ✅ Addressed
- Lock mechanism prevents abuse
- Timeout prevents resource exhaustion
- Explicit nonce prevents transaction conflicts
- User-friendly errors don't expose internal details
- Lock auto-expires to prevent permanent blocks

### ⚠️ Consider for Production
- Add Redis-based distributed locking for multi-server deployments
- Add rate limiting per IP address
- Add honeypot detection for malicious actors
- Monitor admin wallet balance and alert when low
- Add transaction fee monitoring and alerts

## Deployment Steps

1. **Deploy backend changes**
   ```bash
   docker compose exec app pnpm build
   docker compose restart app
   ```

2. **Verify backend is running**
   ```bash
   curl -X POST http://localhost:3000/api/pledges/register \
     -H "Content-Type: application/json" \
     -d '{"treasuryAddress": "0x...", "pledgeId": "0x...", "gatewayFee": 0}'
   # Should return 401 (unauthorized) since no session
   ```

3. **Test with authenticated user**
   - Log in to app
   - Attempt donation
   - Check logs for proper flow

4. **Monitor for errors**
   - Watch for REPLACEMENT_UNDERPRICED (should be gone)
   - Watch for lock conflicts (should see clear errors)
   - Watch for successful donations

## Rollback Plan

If issues occur:

1. **Quick rollback**
   ```bash
   git revert <commit-hash>
   docker compose exec app pnpm build
   docker compose restart app
   ```

2. **Disable new endpoint**
   - Comment out the lock acquisition
   - Deploy minimal version

3. **Emergency bypass**
   - Temporarily remove registration requirement
   - Handle fees manually
   - Deploy permanent fix later

## Success Criteria

✅ Fix is successful when:
- No REPLACEMENT_UNDERPRICED errors in logs
- All donations complete successfully
- Users see clear error messages when issues occur
- Lock mechanism prevents concurrent requests
- Timeouts don't hang indefinitely
- Double-clicks don't cause duplicate transactions

## Summary

The fixes address both the immediate issue (concurrent transactions) and the underlying problems (error handling, nonce management, timeout protection). The combination of backend locking, explicit nonce management, and enhanced client-side error handling ensures a robust, user-friendly donation flow.

**Key Improvements:**
1. 🔒 Backend locking prevents concurrent registrations
2. 🎯 Explicit nonce management prevents transaction conflicts
3. ⏱️ Timeout protection prevents hanging
4. 📝 Enhanced logging aids debugging
5. 💬 User-friendly error messages guide users
6. ✋ Complete flow halt on registration failure
7. 🔄 Lock auto-cleanup prevents permanent blocks

**Status:** Ready for testing
**Priority:** 🔴 **Critical** - Required for all donations to work

