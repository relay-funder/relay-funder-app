# Donation Investigation Report: User 0x94b533...

**Date:** January 27, 2026
**Investigator:** Claude (AI Assistant)
**Subject:** Missing/untracked donations from wallet `0x94b533563dDEAbc87A75A8DC8e2c073D5b20662b`

---

## Executive Summary

A user made three donations totaling **$312.50** via Daimo Pay on January 27, 2026. All three transactions were successfully processed by Daimo and delivered to Celo. However, only one payment ($53.50) appears in the admin payments table, and that one shows "Pledge Failed."

**Key Finding:** No funds are lost. All donations were delivered to destination addresses on Celo. Two of the three payments ($107 and $152) were never recorded in the Relay Funder database.

---

## Transaction Summary

| # | Source Chain | Amount | Token | Celo Destination | Destination Type | In Database? |
|---|--------------|--------|-------|------------------|------------------|--------------|
| 1 | Ethereum | $152.00 | USDC | `0xE291380119f55c502ea4CCf4F9059e06be9d45b6` | Unknown | **NO** |
| 2 | Ethereum | $53.50 | DAI | `0x914705D58a0fCb2217590BA3b16FE9Cc5A061130` | RelayTreasury | YES (Failed) |
| 3 | Ethereum | $107.00 | DAI | `0x018F1E570A02b8D60d4B0C47Fa845A75b628CE90` | EIP-1167 Proxy | **NO** |

---

## Detailed Transaction Analysis

### Transaction 1: $152 USDC

**Ethereum (Source):**
- Tx Hash: `0x20bbb423d1453c4b0b6beac94b28a16242ead5eabd57184e1efca482b254bad6`
- From: `0x94b533563dDEAbc87A75A8DC8e2c073D5b20662b`
- To: Daimo Intent Contract `0x202b5B4a9c114Ed115e674A614360a849Fa3A104`
- Amount: 152 USDC
- Timestamp: January 27, 2026, 00:26:23 UTC

**Celo (Destination):**
- Tx Hash: `0x7c44d56586eb95e266be9d5b9da7fc9b968f953df3bed7b79eb8680f8483ff25`
- Final Recipient: `0xE291380119f55c502ea4CCf4F9059e06be9d45b6`
- Amount: 152 USDT
- Timestamp: January 27, 2026, 00:26:48 UTC
- Status: **SUCCESS**

**Destination Analysis:**
- Address type: EOA (Externally Owned Account)
- Not found in codebase
- Not a recognized RelayTreasury contract

---

### Transaction 2: $53.50 DAI

**Ethereum (Source):**
- Tx Hash: `0x2034f1d92f937e37ae17706e6c9f3ebc343a5db6c032c47ccbdaa9103db8d8ab`
- From: `0x94b533563dDEAbc87A75A8DC8e2c073D5b20662b`
- To: Daimo Intent Contract `0x73ed13F38E47b3A1e48c075230E024E315C947BA`
- Amount: 53.5 DAI
- Timestamp: January 27, 2026, 00:30:47 UTC

**Celo (Destination):**
- Tx Hash: `0xe8d6156938b747f010c2f0a28f8ecdd9b37422f2302c0a779e7325467a7f75f9`
- Final Recipient: `0x914705D58a0fCb2217590BA3b16FE9Cc5A061130` (**RelayTreasury**)
- Amount: 53.5 USDT
- Timestamp: January 27, 2026, 00:30:53 UTC
- Status: **SUCCESS**

**Database Record:**
- Payment ID: Unknown (appears in admin table)
- Base Amount: 50 USDT
- Tip: 2.5 USDT
- Campaign: "Friends of Kaya Pool In Kwale Kenya"
- Round: "Celo - Prezenti Round"
- Pledge Status: **FAILED**
- Payment Status: Confirmed

**Why Pledge Failed:**
This payment is affected by the destination address mismatch bug documented in `DAIMO_PAY_GATEWAY_FLOW.md`. Daimo delivered funds directly to the campaign treasury instead of the platform admin wallet, so the server-side pledge execution failed due to insufficient admin wallet balance.

---

### Transaction 3: $107 DAI

**Ethereum (Source):**
- Tx Hash: `0x3ae36f30e0125272611b4e16e459338fb1f8ed442de84d48c1ea2bf41e4cd405`
- From: `0x94b533563dDEAbc87A75A8DC8e2c073D5b20662b`
- To: Daimo Intent Contract `0x7e8660057d3d602dD73Cf4b89e97222f9a2E387e`
- Amount: 107 DAI
- Timestamp: January 27, 2026, 00:33:23 UTC

**Celo (Destination):**
- Tx Hash: `0xcaa3274d8ca933b7035277fe0631b1f55381e262b9f40b4ae1329a9f2bb431da`
- Final Recipient: `0x018F1E570A02b8D60d4B0C47Fa845A75b628CE90`
- Amount: 107 USDT
- Timestamp: January 27, 2026, 00:33:43 UTC
- Status: **SUCCESS**

**Destination Analysis:**
- Address type: **Smart Contract** (EIP-1167 Minimal Proxy)
- Implementation: `0x55eD3BcB9d0c89DAd6Cd5D64C1C256d7B3c9D83C`
- Has `Initialized(uint64 version)` event (version 1)
- Likely a campaign treasury contract, but not labeled as "RelayTreasury"

---

## Daimo Intent Analysis

Both the $107 and $152 payments have decoded Daimo intent data showing the destination addresses were **explicitly configured** in the payment intents:

**$107 Intent (decoded from Celo tx):**
```
intent.destination = (
  address: 0x018F1E570A02b8D60d4B0C47Fa845A75b628CE90,
  amount: 0,
  calldata: 0x
)
```

**$152 Intent (decoded from Celo tx):**
```
intent.destination = (
  address: 0xE291380119f55c502ea4CCf4F9059e06be9d45b6,
  amount: 0,
  calldata: 0x
)
```

This confirms Daimo delivered funds exactly where instructed. The question is: **who configured these destinations?**

---

## Root Cause Analysis

### Hypothesis 1: Payments Made Outside the App

The user may have initiated these payments directly through Daimo Pay (daimo.com) or another interface, not through the Relay Funder app. This would explain why:
- No payment records exist in the database
- The destination addresses don't match known platform addresses

### Hypothesis 2: Frontend Bug Creating Orphan Payments

There may be a bug where the frontend:
1. Creates a Daimo payment intent with a destination address
2. But fails to create a corresponding payment record in the database
3. User completes payment, funds are delivered, but no record exists

### Hypothesis 3: Destination Address Mismatch Bug (Known Issue)

As documented in `DAIMO_PAY_GATEWAY_FLOW.md`, there is a known bug where:
- `daimo-button.tsx` sets `toAddress = NEXT_PUBLIC_PLATFORM_ADMIN`
- `useDaimoReset.ts` can overwrite this to `toAddress = treasuryAddress`

However, this bug typically causes funds to go to **treasury contracts**, not unknown EOAs. The $152 destination (`0xE29138...`) is an EOA, which doesn't fit this pattern.

---

## Recommended Actions

### Immediate

1. **Query Database for Treasury Addresses**
   ```sql
   SELECT * FROM campaigns
   WHERE treasury_address IN (
     '0x018F1E570A02b8D60d4B0C47Fa845A75b628CE90',
     '0xE291380119f55c502ea4CCf4F9059e06be9d45b6'
   );
   ```

2. **Contact the User**
   - Ask if they initiated payments through the Relay Funder app or directly through Daimo
   - Ask if they recognize the destination addresses

3. **Check Daimo Webhook Logs**
   - Look for webhook events around January 27, 2026 00:26-00:34 UTC
   - Check if webhooks were received but failed to process

### Short-Term

4. **Audit Payment Creation Flow**
   - Trace the code path from donation button click to database record creation
   - Identify any failure points where Daimo intent is created but DB record is not

5. **Add Monitoring**
   - Alert on Daimo webhook failures
   - Log all Daimo intent creations with their destination addresses

### Long-Term

6. **Fix Destination Address Mismatch Bug**
   - Update `useDaimoReset.ts` to use admin wallet address consistently
   - Add server-side validation in webhook handler

---

## Appendix: Key Addresses

| Address | Type | Description |
|---------|------|-------------|
| `0x94b533563dDEAbc87A75A8DC8e2c073D5b20662b` | EOA | Donor wallet (Ethereum) |
| `0x914705D58a0fCb2217590BA3b16FE9Cc5A061130` | Contract | RelayTreasury (confirmed) |
| `0x018F1E570A02b8D60d4B0C47Fa845A75b628CE90` | Contract | EIP-1167 Proxy (likely treasury) |
| `0xE291380119f55c502ea4CCf4F9059e06be9d45b6` | EOA | Unknown recipient |
| `0xB50F370B47C8cEFE54e5D5F5ce1BDdcebEF56DDF` | Contract | DaimoPayRelayer |
| `0xbdb9F958e2F0e38D89173374E24Ee335B50ed128` | Contract | DaimoPay |

---

## Appendix: Timeline

| Time (UTC) | Event |
|------------|-------|
| 00:26:23 | User sends 152 USDC to Daimo intent on Ethereum |
| 00:26:48 | Daimo delivers 152 USDT to `0xE29138...` on Celo |
| 00:30:47 | User sends 53.5 DAI to Daimo intent on Ethereum |
| 00:30:53 | Daimo delivers 53.5 USDT to RelayTreasury on Celo |
| 00:33:23 | User sends 107 DAI to Daimo intent on Ethereum |
| 00:33:43 | Daimo delivers 107 USDT to `0x018F1E...` on Celo |

---

## Conclusion

All three donations ($312.50 total) were successfully processed by Daimo and delivered to Celo addresses. The funds are not lost. However, two payments ($259 total) are untracked in the Relay Funder database.

**Priority:** Identify which campaigns (if any) the destination addresses belong to, and determine whether these payments were initiated through the app or externally.
