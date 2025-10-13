# KeepWhatsRaised Treasury Testing Scripts

This directory contains shell scripts that simulate the KeepWhatsRaised treasury flow using Foundry's `cast` commands. These scripts are designed for testing and demonstration purposes outside of the smart contract development environment, focusing specifically on the KeepWhatsRaised funding model.

## Prerequisites

1. **Foundry installed** with `cast` command available
2. **jq installed** for JSON parsing (`brew install jq` on macOS)
3. **python3 available** for mathematical calculations
4. **Environment configuration** - Copy `util/env.foundry.template` to `util/env.foundry` and fill in your actual values
5. **Funded wallets** - Ensure test wallets have sufficient ETH for gas and USDT for pledging

## KeepWhatsRaised Treasury Flow

### Script: `kwr_flow_test.sh`

Simulates a complete KeepWhatsRaised campaign lifecycle from creation to fund withdrawal using small test amounts (0.1 USDT pledges).

#### Flow Steps:

1. **Environment Setup** - Sources `env.foundry` and validates required tools (`cast`, `jq`, `python3`)
2. **Platform Setup** - Ensures platform is listed in GlobalParams, adds platform data keys for fees/commissions, registers and approves KeepWhatsRaised implementation via `TreasuryFactory`
3. **Campaign Creation** - Creator creates a new campaign via `CampaignInfoFactory` with unique identifier
4. **Treasury Deployment** - Platform admin deploys KeepWhatsRaised treasury contract via `TreasuryFactory`
5. **Treasury Configuration** - Configure withdrawal delays (1 hour), refund delays (2 hours), configuration lock period (30 minutes), Colombian flag, fee exemption threshold (0.5 USDC), and campaign parameters
6. **Campaign Launch Wait** - Waits for campaign launch time with detailed countdown logging
7. **Pledge Flow** - Backer approves USDT and makes pledge with comprehensive balance verification
8. **Balance Verification** - Shows before/after balances for backer, treasury totals, and available amounts
9. **Interactive Pause** - Allows verification of pledge success before proceeding to withdrawal
10. **Withdrawal Approval** - Platform admin approves fund withdrawal
11. **Creator Withdrawal** - Creator attempts to withdraw available funds
12. **Final Verification** - Checks creator balance changes and remaining treasury amounts

### Setup

Before running the script, you need to configure your environment:

```bash
# Copy the template and fill in your actual values
cp util/env.foundry.template util/env.foundry

# Edit the file and replace all YOUR_*_HERE placeholders with actual values
# IMPORTANT: Never commit util/env.foundry to version control
```

#### Usage:

```bash
# Run complete KeepWhatsRaised flow (will pause after pledge for verification)
bash util/kwr_flow_test.sh

# The script will show detailed output including:
# - Contract addresses and configuration
# - Wait times with countdown
# - Balance changes at each step
# - Pause point for manual verification
```

#### Key Features:

- **Small test amounts** - Uses 0.1 USDT pledges (allows 50+ tests with 5 USDT balance)
- **Comprehensive logging** - Shows all balances, addresses, and timing information
- **Interactive verification** - Pauses after pledge to allow manual inspection
- **Unique campaigns** - Each run creates a new campaign with unique identifier
- **Robust error handling** - Handles nonce management, transaction parsing, gas estimation, and platform setup failures
- **Real-world simulation** - Mimics actual user interactions with proper transaction sequencing

#### Environment Variables Required:

From `util/env.foundry`:

- `NEXT_PUBLIC_RPC_URL` - Network RPC endpoint (Alfajores testnet)
- `PLATFORM_ADMIN_PRIVATE_KEY` - Platform admin wallet private key
- `PROTOCOL_ADMIN_PRIVATE_KEY` - Protocol admin wallet private key
- `CREATOR_PRIVATE_KEY` - Campaign creator wallet private key
- `BACKER_PRIVATE_KEY` - Backer wallet private key
- `NEXT_PUBLIC_USDT_ADDRESS` - USDT token contract address (6 decimals)
- `NEXT_PUBLIC_USDT_DECIMALS` - USDT decimal places (6)
- `NEXT_PUBLIC_GLOBAL_PARAMS` - GlobalParams contract address
- `NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY` - CampaignInfoFactory contract address
- `NEXT_PUBLIC_TREASURY_FACTORY` - TreasuryFactory contract address
- `NEXT_PUBLIC_PLATFORM_HASH` - Platform identifier hash
- `NEXT_PUBLIC_PLATFORM_ADMIN` - Platform admin wallet address
- `KEEP_WHATS_RAISED_IMPLEMENTATION` - KeepWhatsRaised implementation address
- `KEEP_WHATS_RAISED_IMPLEMENTATION_ID` - Implementation ID for KeepWhatsRaised (defaults to 0)

#### Script Configuration:

- **Campaign Duration**: 120 seconds (2 minutes for quick testing)
- **Launch Offset**: 20 seconds from creation
- **Pledge Amount**: 0.1 USDT per test
- **Campaign Goal**: 1 USDT (easily achievable)
- **Withdrawal Delay**: 1 hour (reduced from 7 days for testing)
- **Fee Exemption Threshold**: 0.5 USDT
- **Platform Fees**:
  - Flat Fee: 0.001 USDT per pledge
  - Cumulative Flat Fee: 0.002 USDT (applied once when threshold exceeded)
  - Platform Fee: 10% (1000 basis points)
  - Vaki Commission: 6% (600 basis points)

#### Current Status:

✅ **Working Components:**

- Campaign creation via factory
- Treasury deployment and configuration
- Pledge flow with balance verification
- Comprehensive logging and error handling
- Interactive verification points

🔧 **Known Issues:**

- Withdrawal step currently fails with error `0x7ce6c522` (under investigation)
- May be related to timing, authorization, or fee calculation
- **Withdrawal Logic**: Uses `withdraw(amount)` with specific available amount before deadline; `withdraw(0)` only valid after deadline

#### Example Output:

```
Using RPC: https://alfajores-forno.celo-testnet.org
CampaignInfoFactory: 0x3c95449E75C9e3F2C10FF1225f139293D0fb45D3
TreasuryFactory:     0x9F42bF9e482de836972C9bde5618F8A88a325BCd
GlobalParams:        0xed944522b41CC8B790eb0825720C98D336a8484C
USDT:                0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e (decimals=6)
Platform Hash:       0x8dfe5499a94ebda35ae3d6c7b6c32b140c2cb04687d76f2cc3564ada0ef5dce6
Creator:             0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70
Backer:              0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70

Ensuring platform and data keys are set...
Registering KWR implementation (id=0)...
Approving KWR implementation...

Creating campaign...
Campaign deployed at: 0x5fcee5dd0fe9de6c2c2b5d0131269a931767158a
Deploying KeepWhatsRaised treasury...
Treasury deployment tx: 0xf497dbd660f0e1620e9aaef0f5131425867d27a9b7f1d7c2ceea50841b53a70c
Treasury deployed at: 0x02acaf22fe72e3981e4db4f73bc54bfcb30f8b5f

Configuring treasury...
Waiting for campaign launch time...
Current time: 1756221703, Launch time: 1756221705, Need to wait: 7 seconds
Waiting 7 seconds for campaign launch...
  ... 5/7 seconds elapsed
  ... 7/7 seconds elapsed
Campaign should now be live!

Backer USDT balance before pledge: 14.24648 USDT
About to pledge: 0.1 USDT (+ 0 tip)
Backer USDT balance after pledge: 14.24648 USDT
Treasury total raised: 0.1 USDT
Treasury available for withdrawal: 0.084 USDT
Treasury USDT token balance: 0.1 USDT

=== PLEDGE VERIFICATION COMPLETE ===
Press Enter to continue with withdrawal test, or Ctrl+C to stop here...
```

#### Notes:

- **KeepWhatsRaised focused** - Tests only KeepWhatsRaised treasury model (implementation ID 0)
- **Independent of Solidity tests** - Uses `util/env.foundry` directly
- **No additional platform setup required** - Uses existing deployed contracts
- **Automatic nonce management** - Handles sequential transactions properly
- **Event log parsing** - Extracts contract addresses from transaction receipts using specific event signatures
- **Balance calculations** - Uses Python for precise decimal arithmetic
- **Unique identifiers** - Generates campaign IDs using timestamp and random values to prevent collisions
- **Advanced nonce management** - Explicitly manages transaction nonces to avoid race conditions
- **Platform data key management** - Automatically adds and verifies fee/commission configuration keys

## Other Treasury Types

This directory currently focuses on KeepWhatsRaised treasury testing only. Other treasury types (AllOrNothing, PaymentTreasury) are available in the codebase but not tested by these scripts.

- **AllOrNothing**: All-or-nothing funding model (not tested here)
- **PaymentTreasury**: Credit card payment integration (not tested here)
