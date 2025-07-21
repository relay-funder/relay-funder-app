# CC Protocol Staging Environment Setup

## 🚀 Quick Start Guide

This guide helps you set up the CC Protocol staging environment for dual treasury testing.

## 📋 Prerequisites

1. ✅ Dual treasury implementation completed
2. ✅ Database schema updated with dual treasury fields
3. ✅ Treasury managers implemented and tested
4. ✅ Docker environment running

## 🔧 Environment Setup

### 1. Copy Staging Configuration

```bash
# Copy the staging environment file
cp cc-protocol-staging.env .env.local
```

### 2. Add Complete Private Keys

Edit `.env.local` and replace the truncated private keys with the full keys provided by CC Protocol:

```bash
# Platform Admin Wallet (for treasury deployment, payment operations)
PLATFORM_ADMIN_PRIVATE_KEY=0xfef684505b... # Replace with full key

# Protocol Admin Wallet (for implementation approval, protocol-level operations)
PROTOCOL_ADMIN_PRIVATE_KEY=0x83e2056711... # Replace with full key
```

### 3. Verify Configuration

Check that all required variables are set:

```bash
# Key addresses from CC Protocol deployment
echo "Platform Hash: $NEXT_PUBLIC_PLATFORM_HASH"
echo "Treasury Factory: $NEXT_PUBLIC_TREASURY_FACTORY"
echo "Global Params: $NEXT_PUBLIC_GLOBAL_PARAMS"
echo "USDC Address: $NEXT_PUBLIC_USDC_ADDRESS"
echo "Platform Admin: $NEXT_PUBLIC_PLATFORM_ADMIN"
echo "Protocol Admin: $NEXT_PUBLIC_PROTOCOL_ADMIN"
```

## 🧪 Testing Workflow

### 1. Start Application

```bash
# Ensure database is running and up to date
docker-compose exec app pnpm prisma migrate dev

# Start the application
docker-compose up
```

### 2. Test Campaign Creation

1. Navigate to admin interface
2. Create a new campaign
3. Submit for admin approval

### 3. Test Dual Treasury Deployment

When approving a campaign, the system should:

1. Deploy KeepWhatsRaised treasury (implementationId: 0)
2. Deploy PaymentTreasury (implementationId: 1)
3. Store both addresses in database
4. Update campaign status

### 4. Test Payment Flows

#### **Crypto Payment Flow**

1. Connect wallet to campaign page
2. Select crypto payment method
3. Approve USDC spending
4. Execute `pledgeWithoutAReward()` transaction
5. Verify treasury balance update

#### **Credit Card Payment Flow**

1. Select credit card payment method
2. Process payment through Stripe
3. Crowdsplit webhook calls `confirmPayment()`
4. Verify PaymentTreasury balance update

## 🔍 Verification Commands

### Check Treasury Implementations

```bash
# Verify KeepWhatsRaised implementation is approved
cast call $TREASURY_FACTORY_ADDRESS \
  "approvedImplementations(address)" \
  $KEEP_WHATS_RAISED_IMPLEMENTATION \
  --rpc-url $NEXT_PUBLIC_RPC_URL

# Verify PaymentTreasury implementation is approved
cast call $TREASURY_FACTORY_ADDRESS \
  "approvedImplementations(address)" \
  $PAYMENT_TREASURY_IMPLEMENTATION \
  --rpc-url $NEXT_PUBLIC_RPC_URL
```

### Check Treasury Balances

```bash
# Check KeepWhatsRaised treasury balance
cast call $CRYPTO_TREASURY_ADDRESS \
  "getRaisedAmount()" \
  --rpc-url $NEXT_PUBLIC_RPC_URL

# Check PaymentTreasury balance
cast call $PAYMENT_TREASURY_ADDRESS \
  "getRaisedAmount()" \
  --rpc-url $NEXT_PUBLIC_RPC_URL
```

### Check Admin Permissions

```bash
# Verify platform admin address
cast call $GLOBAL_PARAMS_ADDRESS \
  "getPlatformAdminAddress(bytes32)" \
  $NEXT_PUBLIC_PLATFORM_HASH \
  --rpc-url $NEXT_PUBLIC_RPC_URL

# Verify protocol admin address
cast call $GLOBAL_PARAMS_ADDRESS \
  "getProtocolAdminAddress()" \
  --rpc-url $NEXT_PUBLIC_RPC_URL
```

## 🛠️ Troubleshooting

### Common Issues

#### **Treasury Deployment Fails**

- ✅ Check that implementations are approved by protocol admin
- ✅ Verify platform admin has sufficient gas (CELO)
- ✅ Ensure correct platform hash is being used

#### **Payment Processing Fails**

- ✅ Verify treasury addresses are stored in database
- ✅ Check that platform admin signer is being used
- ✅ Confirm payment expiration times are in the future

#### **Admin Permission Errors**

- ✅ Verify you're using the correct private keys
- ✅ Check that admin addresses match environment variables
- ✅ Ensure you're calling functions with the right admin role

### Debug Commands

```bash
# Check platform admin balance
cast balance $NEXT_PUBLIC_PLATFORM_ADMIN --rpc-url $NEXT_PUBLIC_RPC_URL

# Check protocol admin balance
cast balance $NEXT_PUBLIC_PROTOCOL_ADMIN --rpc-url $NEXT_PUBLIC_RPC_URL

# View recent transactions
cast tx $TRANSACTION_HASH --rpc-url $NEXT_PUBLIC_RPC_URL
```

## 📊 Key Staging Addresses

| Component                | Address                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| **Platform Hash**        | `0x8dfe5499a94ebda35ae3d6c7b6c32b140c2cb04687d76f2cc3564ada0ef5dce6` |
| **Treasury Factory**     | `0x355238dfFC33E3637C5643230831459Aa4f48FaD`                         |
| **Global Params**        | `0x4A3178cc4F27362ef2500989D7319a4a8064B939`                         |
| **USDC Token**           | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`                         |
| **Platform Admin**       | `0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70`                         |
| **Protocol Admin**       | `0x097bd2E03586724050B5ee2F2fa7B712F8bCF7de`                         |
| **KeepWhatsRaised Impl** | `0x3477b320AAEeFd71Ceb8140741f71171064BB058`                         |
| **PaymentTreasury Impl** | `0x36F6f3b81C209675202B6A162eD9599C5F861f1D`                         |

## ⚠️ Security Reminders

- 🔒 **These are STAGING keys only** - never use in production
- 🔒 **Keys are for testnet CELO network** - no real value
- 🔒 **Admin wallets have testnet gas** - ready for testing
- 🔒 **All transactions are on Alfajores testnet**

## 📈 Success Criteria

Your setup is working correctly when:

- ✅ Campaign approval deploys both treasuries
- ✅ Crypto payments update KeepWhatsRaised balance
- ✅ Credit card payments update PaymentTreasury balance
- ✅ Admin dashboard shows dual treasury addresses
- ✅ Both payment methods are available to users
- ✅ Treasury balances display correctly in UI

Ready to test the dual treasury system! 🎉
