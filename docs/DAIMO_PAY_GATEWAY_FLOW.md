# Daimo Pay Gateway Flow (Relay Funder)

This doc explains:

- The intended "gateway" design (Daimo -> admin wallet -> treasury pledge).
- What actually happened for payments **#119** and **#121** on **January 26, 2026**.
- Why the admin UI shows **payment confirmed** but **pledge failed**.
- Why campaign reconciliation shows a large "treasury short" difference.
- The code-level root cause and where it was introduced.

## Terminology

- **Total amount (Daimo)**: what the donor pays in the Daimo checkout. In our UI this is:
  - `base donation` + `tip` + `Daimo fee (1% of base)` + `protocol fee (PROTOCOL_FEE_RATE)`
  - See `lib/hooks/useDaimoPayment.ts`.
- **Total received from Daimo (Relay)**: what Relay expects to pledge into the treasury:
  - `base donation` + `tip`
  - This is what `executeGatewayPledge()` transfers to the treasury via `setFeeAndPledge`.

## Intended Architecture (Gateway)

Goal: keep treasury contract accounting consistent (pledge receipts, round accounting) and keep fees at the platform.

1. Client configures Daimo checkout:
   - `toAddress = NEXT_PUBLIC_PLATFORM_ADMIN` (platform admin hot wallet)
   - `toUnits = base + tip + fees`
   - metadata includes `campaignId`, `treasuryAddress`, etc.
   - File: `components/campaign/donation/daimo-button.tsx`

2. Daimo completes payment and delivers funds **to the admin wallet** (destination tx on Celo).

3. Daimo webhook hits our server (`/api/webhooks/daimo-pay`):
   - We update the DB payment to `status=confirmed`.
   - We launch a fire-and-forget pledge execution:
     - `executeGatewayPledgeWithBalanceRetry(paymentId, destinationTxHash)`
   - File: `app/api/webhooks/daimo-pay/route.ts`

4. Server executes the pledge from the admin wallet:
   - Reads admin USDT/USDC balance.
   - Transfers **(base + tip)** to the treasury via `KeepWhatsRaised.setFeeAndPledge(...)`.
   - Leaves **fees** (Daimo + protocol) in the admin wallet.
   - File: `lib/api/pledges/execute-gateway-pledge.ts`

If this flow is working correctly:

- Admin dashboard shows `Pledge Status = Executed`.
- Treasury contract `getRaisedAmount()` increases by the pledged amount.
- Platform keeps fees (they do not end up in treasury balance).

## What Actually Happened (Payments 119 and 121)

### Key On-Chain Facts (both payments)

Both Daimo "destination" transactions called the Daimo relayer contract and **paid the campaign treasury directly**.

- Daimo relayer contract: `0xB50F370B47C8cEFE54e5D5F5ce1BDdcebEF56DDF`
- DaimoPay contract: `0xbdb9F958e2F0e38D89173374E24Ee335B50ed128`

You can confirm via Blockscout V2 API:

```bash
# Token transfers for Daimo destination tx (includes the final transfer to the treasury)
curl -s 'https://celo.blockscout.com/api/v2/transactions/<TX_HASH>/token-transfers'

# Full tx decode (shows fastFinish intent including destination address)
curl -s 'https://celo.blockscout.com/api/v2/transactions/<TX_HASH>'
```

### Payment 119 (DB Payment ID 119)

DB snapshot (from admin UI):

- Base: 10 USDT
- Tip: 0.5 USDT
- Total received from Daimo (expected pledge): 10.5 USDT
- Total paid in Daimo checkout (includes fees): 10.7 USDT

On-chain:

1. **Daimo destination tx**: `0x1bdf4e4dd33084ed1840f28074cbb0e5f5ca5df3ad1363416741ce2339f389de`
   - Timestamp (Blockscout): `2026-01-27T00:14:54Z`
   - Final token transfer: **10.7 USDT -> treasury `0x3Ace...`**

2. **Separate gateway pledge tx**: `0xc0a8b481a1ca4310ae21b519d7c625963837e8ccd4bfc036ed944db083cf11c1`
   - Timestamp (Blockscout): `2026-01-27T00:15:34Z`
   - From platform admin wallet `0x4267...` -> treasury `0x3Ace...`
   - Token transfer: **10.5 USDT**
   - This is `KeepWhatsRaised.setFeeAndPledge` executed by our server.

Interpretation:

- Daimo sent **10.7** to the treasury directly (should have gone to admin wallet).
- Server still executed the pledge for **10.5** from the admin wallet anyway.
- Net: treasury received **~21.2 USDT** from this one donation path, while the treasury contract accounting only reflects the pledge call (not the direct Daimo transfer).

### Payment 121 (DB Payment ID 121)

DB snapshot (from admin UI):

- Base: 50 USDT
- Tip: 2.5 USDT
- Total received from Daimo (expected pledge): 52.5 USDT
- Total paid in Daimo checkout (includes fees): 53.5 USDT

On-chain:

1. **Daimo destination tx**: `0xe8d6156938b747f010c2f0a28f8ecdd9b37422f2302c0a779e7325467a7f75f9`
   - Timestamp (Blockscout): `2026-01-27T00:30:53Z`
   - Final token transfer: **53.5 USDT -> campaign 95 treasury `0x914705...`**

2. **No successful gateway pledge tx** (none exists for payment 121).

Server attempt:

- Webhook marked payment `confirmed`, then launched pledge execution.
- `executeGatewayPledge()` checked admin wallet balance and failed:
  - Required: 52.5 USDT
  - Available: 8.783071 USDT
  - Error string matches `lib/api/pledges/execute-gateway-pledge.ts`.

Interpretation:

- Daimo sent **53.5** directly to treasury.
- Server attempted to also pledge **52.5** from admin wallet, but admin wallet no longer had enough funds (it had been depleted).
- Admin UI shows `Pledge Status = Failed` even though funds are already in the treasury.

## Why Admin UI Shows "Confirmed" but "Pledge Failed"

These are intentionally separate concepts in our DB/state machine:

- `payment.status = confirmed` means: "Daimo told us the payment completed."
- `payment.pledgeExecutionStatus = FAILED` means: "our server-side `setFeeAndPledge` call failed."

For payment 121, that server-side call fails because **the admin wallet never received the Daimo funds**.

Relevant code:

- Webhook triggers pledge execution:
  - `app/api/webhooks/daimo-pay/route.ts` (starts pledge after `status=confirmed`)
- Pledge execution balance check + error string:
  - `lib/api/pledges/execute-gateway-pledge.ts` (throws `Insufficient admin wallet balance...`)

## Why Campaign Reconciliation Shows "Treasury Short"

Campaign reconciliation fetches raw transactions by calling:

- Blockscout: `/api/v2/addresses/<treasury>/transactions`
  - Code: `lib/block-explorer.ts#getBlockExplorerTransactions()`

This endpoint only returns transactions where the treasury is the `to`/`from` of the tx.

But the Daimo delivery transactions are **to the Daimo relayer contract** (`0xB50F...`), not to the treasury.
The treasury only appears in **token transfer logs** inside those transactions.

So the reconciliation page:

- Sees the direct wallet tx to the treasury (e.g. ~7.42),
- Misses the Daimo token transfer into the treasury (53.5),
- And concludes "treasury is short".

Fix direction (for reconciliation accuracy):

- Include Blockscout token transfers endpoint:
  - `/api/v2/addresses/<address>/token-transfers`
  - Or query token transfers by token + toAddress.

## Code-Level Root Cause: Destination Address Mismatch

Today:

- `components/campaign/donation/daimo-button.tsx` configures Daimo checkout with:
  - `toAddress = ADMIN_ADDRESS` (platform admin wallet)
- BUT `lib/hooks/useDaimoReset.ts` calls `resetPayment()` with:
  - `toAddress = validatedTreasuryAddress` (campaign treasury)

If `resetPayment()` runs before the user completes checkout, it can overwrite the Daimo intent and cause Daimo to deliver funds directly to the treasury.

## When This Was Introduced (git archaeology)

The mismatch was created on **November 4, 2025**:

- `5429c9b7` ("do not call toCallData..."):
  - Removed `toCallData` in the reset hook and continued using `toAddress = treasury`.
- `9602efb0` ("toAddress pledge to admin wallet"):
  - Updated `daimo-button.tsx` to use `toAddress = NEXT_PUBLIC_PLATFORM_ADMIN`.
  - `useDaimoReset.ts` did not get updated to match, so it continued resetting to treasury.

## What To Do Next (Recommended)

1. Make Daimo destination consistent with gateway flow:
   - Update `useDaimoReset.ts` to use the admin wallet address (same as the button).
2. Add a server-side safety check in `/api/webhooks/daimo-pay`:
   - If `payload.payment.destination.destinationAddress !== NEXT_PUBLIC_PLATFORM_ADMIN`, do not run gateway pledge.
   - Persist a clear error like "Daimo delivered to non-admin address; manual review required".
3. Fix reconciliation to count token transfers that reach the treasury via relayer contracts.
4. Decide how to handle already-misrouted payments (119, 121):
   - They are in the treasury token balance, but not necessarily counted by `getRaisedAmount()`.
   - Executing the gateway pledge now would likely *double-transfer* unless you first move the misrouted funds out of the treasury (if possible).

