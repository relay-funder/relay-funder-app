# Daimo Pay Integration

This directory contains the Daimo Pay integration for Relay Funder, enabling users to contribute to campaigns using Daimo Pay's checkout system alongside traditional crypto wallet payments.

## Requirements

- **@daimo/pay**: Daimo Pay React SDK
- **@daimo/pay-common**: Constants and utilities
- **wagmi**: ^2.17.5 (Ethereum hooks)
- **viem**: ^2.22.0 (Ethereum TypeScript interface)
- **@tanstack/react-query**: ^5.66.0 (Async state management)

All packages are installed and configured to work with the existing Relay Funder Web3 infrastructure.

## Overview

Daimo Pay provides a streamlined payment experience that supports multiple payment methods including wallets, exchanges, and payment apps. The integration maintains full compatibility with existing CCP (Community Choice Protocol) smart contracts while adding Daimo Pay as an alternative payment method.

## Architecture

### Payment Flow

1. **User Selection**: User chooses between "Crypto Wallet" or "Daimo Pay" tabs
2. **Amount Configuration**: User sets donation amount, tip, and privacy preferences
3. **Payment Initiation**:
   - **Wallet**: Direct blockchain transaction to campaign treasury
   - **Daimo Pay**: Redirects to Daimo Pay checkout with fixed amount
4. **Webhook Processing**: Daimo Pay sends status updates via webhooks
5. **Status Updates**: Payment status updated from "confirming" → "confirmed"/"failed"

### Components

- `daimo-button.tsx` - Core Daimo Pay button component with event handlers
- `daimo-tab.tsx` - Complete donation tab with form fields and Daimo Pay integration
- `../hooks/use-daimo-donation.ts` - Custom hook managing Daimo Pay lifecycle
- `../../../api/webhooks/daimo/route.ts` - Webhook endpoint for payment confirmations

## CCP Smart Contract Integration

### Treasury Compatibility

The Daimo Pay integration works seamlessly with existing CCP treasury contracts:

- **Single Treasury Mode**: Daimo Pay payments are sent directly to campaign treasury addresses
- **USDC on Optimism**: Strictly configured for USDC payments on Optimism chain (Chain ID: 10) - validated at runtime
- **Contract Calls**: ✅ Implemented via `toCallData` prop calling `pledgeWithoutAReward`

### Payment Processing

Daimo Pay follows the same payment recording and validation flow as wallet donations:

1. **Email Validation**: Required email with profile update if missing
2. **Payment Creation**: Records payment with `confirming` status using Daimo payment ID
3. **Pool Amount Calculation**: Subtracts relay funder percentage (matches wallet logic)
4. **Round Contributions**: Created for active campaign rounds
5. **CCP Pledge Recording**: ✅ Calls `pledgeWithoutAReward` via `toCallData` prop
6. **Status Updates**: Handled via webhook (`confirmed`/`failed`)
7. **Notifications**: Sent to campaign creator on successful payment

## ✅ CCP Contract Integration Complete

**Implementation**: Daimo Pay uses the `toCallData` prop to automatically call `pledgeWithoutAReward` on the treasury contract as part of the payment transaction.

**How it works**:
1. Daimo Pay sends USDC to the treasury address
2. Auto-approves treasury contract to spend the USDC amount
3. Executes `pledgeWithoutAReward` with generated pledge ID, backer address, pledge amount, and tip
4. Mints NFT for the backer and updates contract state
5. Webhook confirms successful contract execution

**Benefits**:
- ✅ NFTs minted for Daimo Pay donors
- ✅ Pledge amounts properly tracked in contract
- ✅ Round contributions calculated correctly
- ✅ Full CCP treasury contract integration

## 💰 USDC Payment Validation

Daimo Pay is configured to accept **USDC payments only** to ensure compatibility with CCP treasury contracts:

### Runtime Validation
```typescript
// Validates token and chain configuration at runtime
const USDC_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const OPTIMISM_CHAIN_ID = 10;

// Throws error if not configured for USDC on Optimism
if (configuredToken !== USDC_ADDRESS) {
  throw new Error('Daimo Pay must accept USDC for CCP compatibility');
}
```

### Configuration Requirements
- **Token**: Must be USDC (`0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`)
- **Chain**: Must be Optimism (Chain ID: 10)
- **Decimals**: USDC uses 6 decimal places (handled in contract calls)
- **Contract Compatibility**: CCP treasury contracts expect USDC payments

```typescript
// Daimo Pay button configuration (following official guide)
import { DaimoPayButton } from '@daimo/pay'
import { optimismUSDC } from '@daimo/pay-common'
import { getAddress } from 'viem'

<DaimoPayButton
  appId={process.env.NEXT_PUBLIC_DAIMO_PAY_APP_ID}
  intent="Donate"
  refundAddress={userWalletAddress}     // Required: user's connected wallet
  toChain={optimismUSDC.chainId}         // Optimism chain ID
  toToken={getAddress(optimismUSDC.token)} // USDC on Optimism
  toAddress={campaign.treasuryAddress}  // CCP treasury address
  toUnits={totalAmount}                  // Exact amount to receive
  toCallData={encodeFunctionData({       // Call pledgeWithoutAReward
    abi: KeepWhatsRaisedABI,
    functionName: 'pledgeWithoutAReward',
    args: [pledgeId, userAddress, pledgeAmount, tipAmount],
  })}
  metadata={{
    campaignId: campaign.id.toString(),
    pledgeId: pledgeId,
    email,
    anonymous: anonymous.toString(),
    tipAmount,
    baseAmount: amount,
  }}
  // ... event handlers
/>
```

### Webhook Status Mapping

Daimo Pay webhooks update CCP payment records:

| Daimo Pay Status | CCP Status | Description |
|------------------|------------|-------------|
| `payment_started` | `confirming` | Payment initiated |
| `payment_completed` | `confirmed` | Funds received in treasury |
| `payment_bounced` | `failed` | Contract call reverted |
| `payment_refunded` | `failed` | Payment refunded |

## Provider Setup

The app merges Daimo Pay required chains with existing wallet configuration. DaimoPayProvider is provided locally within each donation tab to ensure proper context isolation while maintaining existing wallet functionality.

**Chain Configuration:**
- **Existing Chains**: Celo Sepolia (default), Celo Mainnet
- **Daimo Pay Chains**: Ethereum, Arbitrum, Base, BNB Smart Chain, Linea, Polygon, Optimism, Scroll, World Chain
- **Merged Config**: All chains available for both wallet connections and Daimo Pay operations

**Provider Order:**
```
Web3ContextProvider (includes WagmiProvider with merged chains)
└── DaimoPayTab
    └── DaimoPayProvider (provides Daimo Pay context)
        └── DaimoPayButtonComponent
```

This approach follows the Daimo Pay requirement that `DaimoPayProvider` must be within a `WagmiProvider` while keeping the implementation modular.

## Environment Setup

### Required Environment Variables

Add to `.env.local`:

```bash
# Public app ID for client-side Daimo Pay integration (same value used for API authentication)
NEXT_PUBLIC_DAIMO_PAY_APP_ID=your_daimo_pay_app_id_here

# Webhook secret token provided by Daimo Pay when configuring webhooks (keep secret)
DAIMO_PAY_WEBHOOK_SECRET=your_webhook_secret_token_here
```

### Daimo Pay Dashboard Setup

1. **Obtain App ID**: Get your app ID from the Daimo Pay dashboard (this single value serves both client and server authentication needs)
2. **Configure Webhook**: Set webhook URL in Daimo Pay dashboard and obtain the webhook secret token (keep this secret)
3. **Test Webhooks**: Use test endpoints to verify webhook functionality

### Security Considerations

- **Public App ID**: `NEXT_PUBLIC_DAIMO_PAY_APP_ID` is exposed to client-side code and is safe to include in public repositories (this single credential serves both client and server authentication needs)
- **Webhook Secret**: `DAIMO_PAY_WEBHOOK_SECRET` is a unique token provided by Daimo Pay for webhook authentication and must remain secret

## Webhook Configuration

### Webhook URL

Configure your Daimo Pay dashboard to send webhooks to:

```
https://yourdomain.com/api/webhooks/daimo
```

### Webhook Payload Structure

Based on official Daimo Pay documentation:

```typescript
interface DaimoPayWebhookPayload {
  type: 'payment_started' | 'payment_completed' | 'payment_bounced' | 'payment_refunded';
  paymentId: string;
  payment: {
    id: string;
    status: string;
    metadata?: {
      campaignId?: string;
      email?: string;
      anonymous?: string;
      tipAmount?: string;
      baseAmount?: string;
    };
    // ... other payment fields
  };
  isTestEvent?: boolean; // For test events
  // ... event-specific fields
}
```

### Webhook Processing

The webhook endpoint (`/api/webhooks/daimo/route.ts`) handles:

1. **Authentication**: Verifies `Authorization: Basic <token>` header matches `DAIMO_PAY_WEBHOOK_SECRET`
2. **Test Events**: Acknowledges without processing to prevent data corruption
3. **Payment Matching**: Finds CCP payment records by Daimo Pay `paymentId`
4. **Status Updates**: Maps Daimo Pay statuses to CCP payment statuses
5. **Notifications**: Sends campaign creator notifications for completed payments
6. **Error Handling**: Graceful handling of missing payments or malformed payloads

#### Authentication Verification
```typescript
// Webhook authentication example
const authHeader = req.headers.get('authorization');
if (!authHeader || !authHeader.startsWith('Basic ')) {
  return response({ error: 'Unauthorized' }, 401);
}

const token = authHeader.slice(6); // Remove 'Basic ' prefix
if (token !== DAIMO_PAY_WEBHOOK_SECRET) {
  return response({ error: 'Unauthorized' }, 401);
}
```

### Webhook Security

- **Token Authentication**: Daimo Pay sends `Authorization: Basic <token>` header with webhook secret token
- **Webhook Secret Verification**: Server verifies the token matches `DAIMO_PAY_WEBHOOK_SECRET`
- **Event Validation**: Validates required fields before processing
- **Idempotent Processing**: Handles duplicate events safely

## Frontend Integration

### Donation Form

The donation form now includes two payment method tabs:

```tsx
<Tabs defaultValue="wallet">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="wallet" className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Crypto Wallet
    </TabsTrigger>
    <TabsTrigger value="daimo" className="flex items-center gap-2">
      <Zap className="h-4 w-4" />
      Daimo Pay
    </TabsTrigger>
  </TabsList>

  <TabsContent value="wallet">
    {/* Existing wallet payment flow */}
  </TabsContent>

  <TabsContent value="daimo">
    <DaimoPayTab campaign={campaign} />
  </TabsContent>
</Tabs>
```

### User Experience

- **Seamless Integration**: Daimo Pay appears as a natural payment option
- **Preserved Functionality**: All existing features (tips, anonymity, email) work with Daimo Pay
- **Real-time Feedback**: Toast notifications for payment status updates
- **Error Handling**: Clear error messages for failed payments

## Testing

### Test Webhooks

Daimo Pay provides test endpoints to verify webhook functionality:

```bash
# Send test webhook to your endpoint
curl -X POST https://yourdomain.com/api/webhooks/daimo \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_completed",
    "isTestEvent": true,
    "paymentId": "test_payment_123",
    "payment": {
      "id": "test_payment_123",
      "status": "payment_completed",
      "metadata": {
        "campaignId": "123",
        "email": "test@example.com"
      }
    }
  }'
```

### Test Events

Test events include an `isTestEvent: true` field and are automatically acknowledged without processing production data.

## Future Enhancements

### Planned Features

1. **Multi-Chain Support**: Extend beyond Optimism to other supported chains
2. **Contract Calls**: Direct integration with CCP contract functions
3. **Bulk Payments**: Support for batch donation processing
4. **Payment Analytics**: Enhanced tracking and reporting

### CCP Contract Integration

Future versions may include:

- Direct contract calls for quadratic funding contributions
- Automated payout distributions through Daimo Pay
- Cross-chain payment bridging for multi-network campaigns

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check webhook URL configuration in Daimo Pay dashboard
   - Verify HTTPS setup for production endpoints
   - Check server logs for webhook processing errors

2. **Payment Status Not Updated**
   - Confirm `paymentId` matching between frontend and webhooks
   - Check database connectivity in webhook endpoint
   - Review webhook payload structure against documentation

3. **Daimo Pay Button Not Loading**
   - Verify `NEXT_PUBLIC_DAIMO_PAY_APP_ID` environment variable
   - Check browser console for SDK loading errors
   - Ensure campaign has valid treasury address

### Logs and Debugging

Enable debug logging by setting the debug utility:

```typescript
import { debugHook as debug } from '@/lib/debug';

debug && console.log('Daimo Pay event:', event);
```

### Support

For Daimo Pay specific issues:
- Check Daimo Pay dashboard for payment/transaction details
- Review webhook delivery logs in Daimo Pay dashboard
- Contact Daimo Pay support for API or webhook issues

For CCP/Relay Funder integration issues:
- Check application logs for payment processing errors
- Verify database payment record creation
- Review campaign treasury configuration
