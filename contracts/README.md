# CC Protocol Contracts Integration Guide

This guide provides comprehensive instructions for testing and deploying CC Protocol contracts with our dual treasury system.

## 🏗️ Contract Architecture Overview

### Treasury Types

1. **KeepWhatsRaised Treasury** (Crypto-Only Flow)

   - **Implementation ID**: `0`
   - **Primary Method**: `pledgeWithoutAReward(address backer, uint256 pledgeAmount, uint256 tip)`
   - **Withdrawal**: Complex fee-based system with admin approval required
   - **Use Case**: Direct wallet-to-wallet USDC payments

2. **PaymentTreasury** (Credit Card Flow)
   - **Implementation ID**: `1`
   - **Primary Methods**: `createPayment()` → `confirmPayment()` workflow
   - **Withdrawal**: Simple `disburseFees()` → `withdraw()` sequence
   - **Use Case**: Fiat-to-crypto via Crowdsplit integration

### Factory System

Both treasuries use the **same TreasuryFactory** contract with different `implementationId` parameters:

- Factory deploys treasury clones using minimal proxy pattern
- Requires implementation registration and approval by protocol admin
- Each treasury type must be registered separately

## 🚀 Local Development Setup

### Prerequisites

1. **Foundry** - Smart contract development toolkit
2. **Node.js 18+** - For our Next.js application
3. **Docker** - For our development environment
4. **CC Protocol Contracts** - Contract ABIs available in `contracts/abi/` directory

### Environment Configuration

Update your `.env.local` with the following CC Protocol addresses:

```bash
# =============================================================================
# DUAL TREASURY CONFIGURATION (MVP TESTING ONLY)
# =============================================================================

# Treasury Mode Configuration
TREASURY_MODE=DUAL

# KeepWhatsRaised Treasury (Crypto-Only Flow)
NEXT_PUBLIC_TREASURY_FACTORY=0x1234567890123456789012345678901234567890    # TreasuryFactory address
NEXT_PUBLIC_GLOBAL_PARAMS=0x2345678901234567890123456789012345678901      # GlobalParams address
NEXT_PUBLIC_PLATFORM_HASH=0x3456789012345678901234567890123456789012      # Platform identifier
NEXT_PUBLIC_PLATFORM_ADMIN=0x4567890123456789012345678901234567890123     # Platform admin wallet

# PaymentTreasury (Credit Card Flow) - Uses same factory
# NEXT_PUBLIC_PAYMENT_TREASURY_FACTORY=                                   # Not needed - uses same factory
NEXT_PUBLIC_PAYMENT_TREASURY_ADMIN=0x5678901234567890123456789012345678901234  # PaymentTreasury admin

# Test Token Configuration
NEXT_PUBLIC_USDC_ADDRESS=0x6789012345678901234567890123456789012345        # USDC token address
NEXT_PUBLIC_USDC_DECIMALS=6

# Feature Flags
NEXT_PUBLIC_ENABLE_DUAL_TREASURY=true
```

## 📋 Contract Deployment Sequence

### 1. Deploy Core Contracts

Using the CC Protocol deployment script available in the `cc-protocol/` directory:

```bash
# Set environment variables
export PRIVATE_KEY="your-private-key"
export PLATFORM_NAME="Akashic"
export PROTOCOL_FEE_PERCENT=100    # 1%
export PLATFORM_FEE_PERCENT=400    # 4%

# Use the test script for deployment verification
./cc-protocol/cc-protocol-test.sh workflow
```

### 2. Register KeepWhatsRaised Implementation

```bash
# Register KeepWhatsRaised (implementation ID = 0)
cast send $TREASURY_FACTORY_ADDRESS \
  "registerTreasuryImplementation(bytes32,uint256,address)" \
  $PLATFORM_HASH \
  0 \
  $KEEP_WHATS_RAISED_IMPLEMENTATION \
  --private-key $PRIVATE_KEY

# Approve implementation
cast send $TREASURY_FACTORY_ADDRESS \
  "approveTreasuryImplementation(bytes32,uint256)" \
  $PLATFORM_HASH \
  0 \
  --private-key $PRIVATE_KEY
```

### 3. Register PaymentTreasury Implementation

```bash
# Register PaymentTreasury (implementation ID = 1)
cast send $TREASURY_FACTORY_ADDRESS \
  "registerTreasuryImplementation(bytes32,uint256,address)" \
  $PLATFORM_HASH \
  1 \
  $PAYMENT_TREASURY_IMPLEMENTATION \
  --private-key $PRIVATE_KEY

# Approve implementation
cast send $TREASURY_FACTORY_ADDRESS \
  "approveTreasuryImplementation(bytes32,uint256)" \
  $PLATFORM_HASH \
  1 \
  --private-key $PRIVATE_KEY
```

## 🧪 Testing Procedures

### Campaign Creation & Treasury Deployment

1. **Create Campaign** via our admin interface
2. **Admin Approval** triggers dual treasury deployment:

```typescript
// In admin approval API route
import { createTreasuryManager } from '@/lib/treasury/interface';

const treasuryManager = await createTreasuryManager('DUAL');

const result = await treasuryManager.deploy({
  campaignId: campaign.id,
  platformBytes: process.env.NEXT_PUBLIC_PLATFORM_HASH!,
  campaignAddress: campaign.campaignAddress!,
  signer: adminSigner,
});

console.log('Treasury deployment result:', result);
```

### Testing KeepWhatsRaised Flow

```bash
# Test crypto donation
cast send $CRYPTO_TREASURY_ADDRESS \
  "pledgeWithoutAReward(address,uint256,uint256)" \
  $BACKER_ADDRESS \
  1000000 \
  0 \
  --private-key $BACKER_PRIVATE_KEY

# Check raised amount
cast call $CRYPTO_TREASURY_ADDRESS \
  "getRaisedAmount()" \
  --rpc-url $RPC_URL
```

### Testing PaymentTreasury Flow

```bash
# Create payment
cast send $PAYMENT_TREASURY_ADDRESS \
  "createPayment(bytes32,address,bytes32,uint256,uint256)" \
  0x1234567890123456789012345678901234567890123456789012345678901234 \
  $BUYER_ADDRESS \
  0x6789012345678901234567890123456789012345678901234567890123456789 \
  1000000 \
  $(($(date +%s) + 3600)) \
  --private-key $ADMIN_PRIVATE_KEY

# Confirm payment (simulates webhook)
cast send $PAYMENT_TREASURY_ADDRESS \
  "confirmPayment(bytes32)" \
  0x1234567890123456789012345678901234567890123456789012345678901234 \
  --private-key $ADMIN_PRIVATE_KEY

# Check raised amount
cast call $PAYMENT_TREASURY_ADDRESS \
  "getRaisedAmount()" \
  --rpc-url $RPC_URL
```

## 🔧 Integration Testing

### 1. Database Verification

After treasury deployment, verify database records:

```sql
-- Check dual treasury addresses are stored
SELECT
  id,
  title,
  treasuryAddress,
  cryptoTreasuryAddress,
  paymentTreasuryAddress,
  treasuryMode
FROM "Campaign"
WHERE id = 'your-campaign-id';
```

### 2. Payment Flow Testing

Test both payment flows through our UI:

1. **Crypto Payment**: Use wallet connection → pledge directly
2. **Credit Card Payment**: Use Stripe → Crowdsplit → PaymentTreasury confirmation

### 3. Admin Dashboard Verification

Verify admin can see:

- Both treasury addresses
- Deployment status indicators
- Individual treasury balances
- Combined balance totals

## 📊 Monitoring & Debugging

### Contract Events

Monitor key events during testing:

```typescript
// KeepWhatsRaised Events
interface ReceiptEvent {
  backer: string;
  reward: bytes32;
  pledgeAmount: bigint;
  tip: bigint;
  tokenId: bigint;
  rewards: bytes32[];
}

// PaymentTreasury Events
interface PaymentCreatedEvent {
  paymentId: bytes32;
  buyerAddress: string;
  itemId: bytes32;
  amount: bigint;
  expiration: bigint;
}

interface PaymentConfirmedEvent {
  paymentId: bytes32;
}
```

### Common Issues & Solutions

1. **Treasury Deployment Fails**

   - ✅ Verify implementation is registered and approved
   - ✅ Check platform admin has sufficient permissions
   - ✅ Ensure correct implementation ID (0 or 1)

2. **Payment Processing Fails**

   - ✅ Verify treasury addresses are stored in database
   - ✅ Check signer has sufficient gas
   - ✅ Confirm payment expiration time is in future

3. **Withdrawal Issues**
   - ✅ KeepWhatsRaised requires `approveWithdrawal()` first
   - ✅ PaymentTreasury requires `disburseFees()` before `withdraw()`
   - ✅ Check admin permissions for withdrawal functions

## 🎯 Testing Checklist

### Pre-Deployment

- [ ] CC Protocol contracts deployed locally
- [ ] Both treasury implementations registered and approved
- [ ] Environment variables configured correctly
- [ ] Database schema includes dual treasury fields

### Treasury Deployment

- [ ] Campaign creation successful
- [ ] Admin approval triggers dual deployment
- [ ] Both treasury addresses stored in database
- [ ] Treasury contracts initialized correctly

### Payment Testing

- [ ] Crypto payments work through KeepWhatsRaised
- [ ] Credit card payments work through PaymentTreasury
- [ ] Payment records created with correct flow type
- [ ] Treasury balances update correctly

### Withdrawal Testing

- [ ] KeepWhatsRaised withdrawal requires approval
- [ ] PaymentTreasury withdrawal works after fee disbursement
- [ ] Admin permissions enforced correctly
- [ ] Funds transferred to campaign owner

### UI Integration

- [ ] Admin dashboard shows dual treasury status
- [ ] Payment method selection works correctly
- [ ] Treasury availability validation working
- [ ] Payment confirmation UI functions properly

## 🔄 Migration Path to Unified Treasury

When ready to migrate to a single unified treasury contract:

1. Update `TREASURY_MODE=UNIFIED` in environment
2. Deploy new unified treasury implementation
3. Register unified implementation with ID `2`
4. Update `createTreasuryManager()` to use unified manager
5. Run database migration to consolidate addresses

The abstraction layer ensures this migration requires minimal code changes.

## 🔐 Admin Wallet Permissions & Functions

### **Platform Admin Wallet** (`0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70`)

The platform admin has control over treasury-specific operations and campaign management:

#### **Treasury Factory Operations**

- `registerTreasuryImplementation()` - Register new treasury implementations
- `removeTreasuryImplementation()` - Remove treasury implementations
- `deploy()` - Deploy new treasury contracts for campaigns

#### **KeepWhatsRaised Treasury Management**

- `approveWithdrawal()` - Approve withdrawals from crypto treasury
- `configureTreasury()` - Set treasury configuration (fees, delays, etc.)
- `updateDeadline()` - Modify campaign deadline (before config lock)
- `updateGoalAmount()` - Modify funding goal (before config lock)
- `claimTip()` - Claim accumulated tips
- `claimFund()` - Claim remaining funds after deadline/cancellation
- `pauseTreasury()` / `unpauseTreasury()` - Emergency treasury controls
- `cancelTreasury()` - Cancel treasury operations

#### **PaymentTreasury Management**

- `createPayment()` - Create payment records for credit card transactions
- `confirmPayment()` - Confirm payments (typically called by webhook)
- `cancelPayment()` - Cancel pending payments
- `claimRefund()` - Process refunds for confirmed payments
- `pauseTreasury()` / `unpauseTreasury()` - Emergency treasury controls
- `cancelTreasury()` - Cancel treasury operations

#### **Global Parameters**

- `updatePlatformAdminAddress()` - Update platform admin address
- `updatePlatformFeePercent()` - Modify platform fee percentage

### **Protocol Admin Wallet** (`0x097bd2E03586724050B5ee2F2fa7B712F8bCF7de`)

The protocol admin has system-wide control and security functions:

#### **Treasury Factory Protocol Operations**

- `approveTreasuryImplementation()` - Approve registered implementations for use
- `disapproveTreasuryImplementation()` - Revoke approval for implementations

#### **Campaign Protocol Operations**

- `_pauseCampaign()` - Emergency pause individual campaigns
- `_unpauseCampaign()` - Resume paused campaigns

#### **Global Protocol Management**

- `updateProtocolAdminAddress()` - Update protocol admin address
- `updateProtocolFeePercent()` - Modify protocol fee percentage

### **Admin Setup for Local Testing**

To use the provided admin wallets in your local environment:

1. **Copy the template environment file**:

   ```bash
   cp cc-protocol/env.foundry.template .env.local
   ```

2. **Add the complete private keys** (provided by CC Protocol team):

   ```bash
   # Replace the truncated keys with full private keys
   PLATFORM_ADMIN_PRIVATE_KEY=0xfef684505b... # Full key from CC Protocol
   PROTOCOL_ADMIN_PRIVATE_KEY=0x83e2056711... # Full key from CC Protocol
   ```

3. **Verify admin permissions** in your application:

   ```typescript
   // Check platform admin can deploy treasuries
   const platformAdminSigner = new ethers.Wallet(
     process.env.PLATFORM_ADMIN_PRIVATE_KEY!,
     provider,
   );

   // Check protocol admin can approve implementations
   const protocolAdminSigner = new ethers.Wallet(
     process.env.PROTOCOL_ADMIN_PRIVATE_KEY!,
     provider,
   );
   ```

### **Security Considerations**

⚠️ **IMPORTANT**: The provided private keys are for **STAGING/TESTNET ONLY**

- ✅ **Safe for local development and testing**
- ❌ **NEVER use these keys in production**
- ✅ **These wallets have testnet CELO for gas fees**
- ✅ **Platform admin can deploy treasuries and manage payments**
- ✅ **Protocol admin can approve implementations and emergency controls**

### **Admin Function Call Examples**

#### **Deploy Dual Treasury (Platform Admin)**

```bash
# Using our treasury manager
const treasuryManager = await createTreasuryManager('DUAL');
const result = await treasuryManager.deploy({
  campaignId: 'campaign-id',
  platformBytes: process.env.NEXT_PUBLIC_PLATFORM_HASH!,
  campaignAddress: 'campaign-contract-address',
  signer: platformAdminSigner,
});
```

#### **Approve Treasury Implementation (Protocol Admin)**

```bash
# Approve PaymentTreasury implementation
cast send $TREASURY_FACTORY_ADDRESS \
  "approveTreasuryImplementation(bytes32,uint256)" \
  $PLATFORM_HASH \
  1 \
  --private-key $PROTOCOL_ADMIN_PRIVATE_KEY
```

#### **Approve Withdrawal (Platform Admin)**

```bash
# Approve KeepWhatsRaised withdrawal
cast send $CRYPTO_TREASURY_ADDRESS \
  "approveWithdrawal()" \
  --private-key $PLATFORM_ADMIN_PRIVATE_KEY
```

## 📞 Support & Resources

- **CC Protocol Setup Guide**: Available in `cc-protocol/CCP-STAGING-SETUP.md`
- **Deployment Test Script**: `cc-protocol/cc-protocol-test.sh`
- **Environment Template**: `cc-protocol/env.foundry.template`
- **Contract ABIs**: Available in `contracts/abi/` directory
- **NFT Contract ABIs**: Available in `contracts/nftABI/` directory

For issues or questions, refer to the CC Protocol documentation in the `cc-protocol/` directory or use the provided test script for deployment verification.
