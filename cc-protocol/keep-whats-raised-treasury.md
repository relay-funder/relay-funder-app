# KeepWhatsRaised Treasury Contract Documentation

This document outlines the usage flow and technical specifications for the `KeepWhatsRaised` treasury smart contract in the CCP. It reflects the current on-chain behavior of `src/treasuries/KeepWhatsRaised.sol` and related factories.

## Main Function Flow

1. `enlistPlatform` → Platform registered in protocol
2. `registerTreasuryImplementation` → KeepWhatsRaised implementation registered
3. `approveTreasuryImplementation` → Implementation approved for use
4. `addPlatformData` → Fee structure keys added (made valid in protocol)
5. `createCampaign` → emits `CampaignInfoFactoryCampaignCreated` → extract `campaignAddress`
6. `deploy` → emits `TreasuryFactoryTreasuryDeployed` → extract `treasuryAddress`
7. `configureTreasury` → Treasury operational parameters, fee keys, and fee values set
8. `addRewards` → Reward tiers created for backers
9. `approveWithdrawal` → One-time enablement of withdrawal for this treasury
10. `setPaymentGatewayFee` (optional per pledge) → Gateway fee set for a specific `pledgeId`
11. `pledgeForAReward` / `pledgeWithoutAReward` or `setFeeAndPledge` → Backer makes pledge → NFT minted
12. `withdraw(amount)` → Campaign owner or platform admin withdraws funds (time-bound), fees applied
13. `claimRefund(tokenId)` → Backer claims refund → NFT burned
14. `claimTip` → Platform admin collects tips (post-deadline or post-cancel)
15. `claimFund` → Platform admin claims remaining funds after grace period
16. `disburseFees` → Accumulated platform/protocol fees distributed

## 1. Deployment Flow

### A. Core Contract Deployment

The following contracts are required in the system:

- TestToken (ERC20) — platform token
- GlobalParams — protocol parameters, admin addresses, platform registry
- CampaignInfo (implementation) — campaign information contract
- TreasuryFactory — deploys treasury clones and initializes them
- CampaignInfoFactory — creates campaign info clones and wires them to treasury factory
- KeepWhatsRaised — treasury implementation contract (cloned by `TreasuryFactory`)

Example deployment (pseudo, test-style):

```solidity
// Example deployment sequence (tests)
testToken = new TestToken("TestToken", "TST");
globalParams = new GlobalParams(protocolAdmin, address(testToken), protocolFeePercent);
campaignInfoImpl = new CampaignInfo(address(this));
treasuryFactory = new TreasuryFactory(IGlobalParams(address(globalParams)));
campaignInfoFactory = new CampaignInfoFactory(
  IGlobalParams(address(globalParams)),
  address(campaignInfoImpl)
);
KeepWhatsRaised keepWhatsRaisedImplementation = new KeepWhatsRaised();
```

### B. System Setup and Configuration

After deployment, the following setup steps must be performed:

- Enlist Platform (protocol admin):

  ```solidity
  GlobalParams(globalParams).enlistPlatform(
    platformHash,
    platformAdminAddress,
    platformFeePercent
  );
  ```

- Register Treasury Implementation (platform admin):

  ```solidity
  TreasuryFactory(treasuryFactory).registerTreasuryImplementation(
    platformHash,
    0,
    address(keepWhatsRaisedImplementation)
  );
  ```

- Approve Treasury Implementation (protocol admin):

  ```solidity
  TreasuryFactory(treasuryFactory).approveTreasuryImplementation(
    platformHash,
    0
  );
  ```

- Add Platform Data Keys (protocol admin): register valid keys so campaigns can reference them

  ```solidity
  GlobalParams(globalParams).addPlatformData(platformHash, PLATFORM_FEE_KEY);
  GlobalParams(globalParams).addPlatformData(platformHash, FLAT_FEE_KEY);
  GlobalParams(globalParams).addPlatformData(platformHash, CUMULATIVE_FLAT_FEE_KEY);
  ```

- Transfer Admin Rights (if needed):

  ```solidity
  GlobalParams(globalParams).updateProtocolAdminAddress(finalProtocolAdmin);
  GlobalParams(globalParams).updatePlatformAdminAddress(platformHash, finalPlatformAdmin);
  ```

## 2. Campaign Creation and Treasury Setup

### A. Campaign Creation

The Campaign Owner creates a new campaign through the `CampaignInfoFactory`:

```solidity
// Campaign creation example
bytes32 platformHash = 0x0000000000000000000000000000000000000000000000000000000000000000; // Example platform
bytes32 identifierHash = keccak256(abi.encodePacked("My Campaign"));

bytes32[] memory selectedPlatformHash = new bytes32[](1);
selectedPlatformHash[0] = platformHash;

// Platform data keys and values for fee configuration (keys must be pre-registered)
bytes32[] memory platformDataKeys = new bytes32[](3);
bytes32[] memory platformDataValues = new bytes32[](3);
platformDataKeys[0] = 0x0000000000000000000000000000000000000000000000000000000000000000; // Platform Fee Key
platformDataKeys[1] = 0x0000000000000000000000000000000000000000000000000000000000000001; // Flat Fee Key
platformDataKeys[2] = 0x0000000000000000000000000000000000000000000000000000000000000002; // Cumulative Fee Key
platformDataValues[0] = bytes32(uint256(1000));   // 10% platform fee (PERCENT_DIVIDER=10000)
platformDataValues[1] = bytes32(uint256(100e18)); // 100 token flat fee
platformDataValues[2] = bytes32(uint256(200e18)); // 200 token cumulative fee

ICampaignData.CampaignData memory campaignData = ICampaignData.CampaignData({
    launchTime: block.timestamp + 1 days,
    deadline: block.timestamp + 31 days,
    goalAmount: 1_000_000e18
});

campaignInfoFactory.createCampaign(
    campaignOwnerAddress,
    identifierHash,
    selectedPlatformHash,
    platformDataKeys,
    platformDataValues,
    campaignData
);
```

### B. Treasury Deployment

The Platform Admin deploys a treasury clone for the campaign via `TreasuryFactory`:

```solidity
// Treasury deployment example
treasuryFactory.deploy(
  platformHash,
  campaignAddress, // Address of the CampaignInfo contract
  0,               // Implementation ID (KeepWhatsRaised)
  "NAME",          // ERC721 Name
  "SYMBOL"         // ERC721 Symbol
);
// Emits: TreasuryFactoryTreasuryDeployed(platformHash, implementationId, campaignAddress, clone)
```

### C. Treasury Configuration

The Platform Admin configures the deployed treasury with operational parameters, fee keys, and the actual fee values to use:

```solidity
// Treasury configuration example
KeepWhatsRaised.Config memory cfg = KeepWhatsRaised.Config({
    minimumWithdrawalForFeeExemption: 50_000e18,
    withdrawalDelay: 7 days,
    refundDelay: 14 days,
    configLockPeriod: 2 days,
    isColombianCreator: false
});

KeepWhatsRaised.FeeKeys memory feeKeys = KeepWhatsRaised.FeeKeys({
    flatFeeKey: 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,
    cumulativeFlatFeeKey: 0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB,
    grossPercentageFeeKeys: new bytes32[](2)
});
feeKeys.grossPercentageFeeKeys[0] = 0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC;
feeKeys.grossPercentageFeeKeys[1] = 0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD;

KeepWhatsRaised.FeeValues memory feeValues = KeepWhatsRaised.FeeValues({
    flatFeeValue: 100e18,
    cumulativeFlatFeeValue: 200e18,
    grossPercentageFeeValues: new uint256[](2)
});
feeValues.grossPercentageFeeValues[0] = 1000; // 10.00%
feeValues.grossPercentageFeeValues[1] = 600;  // 6.00%

keepWhatsRaised.configureTreasury(cfg, campaignData, feeKeys, feeValues);
```

Notes:

- The treasury stores `feeValues` internally and reads them via `getFeeValue(feeKey)` during pledges and withdrawal fee logic.
- Protocol fee percent comes from GlobalParams and is applied at pledge time.

## 3. Campaign Lifecycle and Usage

### A. Active Campaign (Funding Period)

During the active funding period, between `launchTime` and `deadline`, the treasury accepts pledges.

- Reward management: The Campaign Owner can `addRewards` and `removeReward`. Rewards can be primary tiers (`isRewardTier: true`) or add-ons (`isRewardTier: false`). The first reward in `pledgeForAReward` must be a primary tier.

- Withdrawal approval: The Platform Admin must call `approveWithdrawal()` once to enable any withdrawal. This is irreversible.

- Duplicate pledge protection: Each pledge uses an `internalPledgeId = keccak256(abi.encodePacked(pledgeId, msg.sender))`. Re-using the same `pledgeId` from the same caller reverts.

- Facilitating pledges (Platform Admin):

  - `setPaymentGatewayFee(pledgeId, fee)` sets the fee for a unique pledge ID before pledge.
  - `setFeeAndPledge(...)` sets the fee and executes a pledge in one tx. Tokens are transferred from the admin (`msg.sender`) as the source; the NFT is minted to `backer`.

- Pledging flow (direct backer):
  1. Approve tokens on the ERC20 token; 2) Call the pledge function.

```solidity
// Example: backer pledges 1000 tokens without a reward
uint256 pledgeAmount = 1000e18;
uint256 tipAmount = 10e18;
bytes32 pledgeId = keccak256("NEW_PLEDGE");

// Step 1: Backer approves
vm.startPrank(backerAddress);
testToken.approve(address(keepWhatsRaised), pledgeAmount + tipAmount);
vm.stopPrank();

// Step 2: Pledge
keepWhatsRaised.pledgeWithoutAReward(pledgeId, backerAddress, pledgeAmount, tipAmount);
```

```solidity
// Example: admin-assisted pledge with setFeeAndPledge (admin provides tokens)
bytes32 pledgeId2 = keccak256("ADMIN_PLEDGE");
uint256 tip2 = 0;
uint256 adminProvidedAmount = 500e18;
bytes32[] memory rewards = new bytes32[](1);
rewards[0] = bytes32("TIER_A");

// Admin funds and approves their own balance to treasury beforehand if needed
testToken.approve(address(keepWhatsRaised), adminProvidedAmount + tip2);

// One-shot fee set and pledge
keepWhatsRaised.setFeeAndPledge(
  pledgeId2,
  backerAddress,
  adminProvidedAmount,
  tip2,
  40e18,      // gateway fee
  rewards,
  true        // isPledgeForAReward
);
```

### B. Post-Campaign (After Deadline or Cancellation)

Once the campaign ends, functions shift to fund distribution.

- Withdrawing Funds (Campaign Owner or Platform Admin):

  - `approveWithdrawal()` must have been called earlier by the Platform Admin.
  - `withdraw(uint256 amount)` is allowed only up to `deadline + withdrawalDelay`.
  - Partial withdrawal (before deadline): `amount > 0` and `amount + fees <= s_availablePledgedAmount`.
  - Final withdrawal (after deadline within the allowed window): ignores `amount` and withdraws all available; fee may be waived based on threshold (see details below).
  - Note: For partial withdrawals, the creator receives `amount` and the fee is deducted from the remaining available balance. For final withdrawal, the creator receives `available - totalFee`.

- Refunding Pledges (Backers):

  - `claimRefund(uint256 tokenId)` burns the pledge NFT and returns `grossPledge - totalPledgeTimeFees` (percentage + gateway + protocol). Tips are non-refundable.
  - Refund window: active after deadline or cancellation until `refundDelay` elapses.

- Claiming Funds (Platform Admin):

  - `claimTip`: After deadline or cancellation (post-cutoff), collects all tips.
  - `claimFund`: If no withdrawal was made within the grace period, claim all remaining `s_availablePledgedAmount` after:
    - Cancelled: `block.timestamp > cancellationTime + refundDelay`
    - Not cancelled: `block.timestamp > deadline + withdrawalDelay`

- Fee Disbursement:
  - `disburseFees` sends the accumulated `s_protocolFee` and `s_platformFee` to protocol and platform administrators, respectively.

## 4. Fee Structure and Calculations

### A. Fees at Pledge Time

When a pledge is made, fees are calculated upfront and deducted from the gross pledge to determine the net available amount:

- Percentage-based fees: Derived from `getFeeValue(feeKey)` for each key in `grossPercentageFeeKeys` and applied to the gross pledge. Accumulated into `s_platformFee`.
- Payment gateway fee: Fixed per-transaction fee set per `pledgeId` via `setPaymentGatewayFee`. Added to `s_platformFee`.
- Protocol fee: Percentage applied to the gross pledge using `INFO.getProtocolFeePercent()`. Accumulated into `s_protocolFee`.
- Net calculation: `net = pledgeAmount - (platformPercentFees + gatewayFee + protocolFee)`. The total pledge-time fee is stored per token for refund logic.

Example (with protocol fee): A backer pledges 1,000 tokens; gateway fee 40; percentage fees 10% and 6%; protocol fee 2%.

- Percentage fees = 1000\*(10%+6%) = 160
- Protocol fee = 1000\*2% = 20
- Gateway fee = 40
- Total fees = 160 + 20 + 40 = 220
- Net added to `s_availablePledgedAmount` = 1000 − 220 = 780

### B. Fees at Withdrawal Time

When funds are withdrawn via `withdraw(amount)`, flat fees and a regional tax may apply:

- Flat fees (using `getFeeValue`):

  - Partial (before deadline): if `amount < minimumWithdrawalForFeeExemption`, apply `cumulativeFlatFeeKey`; else apply `flatFeeKey`.
  - Final (after deadline): if `available < minimumWithdrawalForFeeExemption`, apply `flatFeeKey`; else the flat fee is waived.

- Protocol fee is NOT applied at withdrawal (already applied at pledge time).

- Colombian Creator Tax: If `isColombianCreator` is true, an additional ~0.4% tax is computed on the withdrawal amount and added to `s_platformFee`:

```solidity
// Inside withdraw
uint256 availableBeforeTax = withdrawalAmount;
if (s_config.isColombianCreator) {
    // ≈ 0.4% effective tax
    uint256 scaled = availableBeforeTax * 10000;
    uint256 numerator = scaled * 40;
    uint256 denominator = 10040;
    uint256 colombianCreatorTax = numerator / (denominator * 10000);
    totalFee += colombianCreatorTax;
}
```

### C. Fees during Refund

If a backer claims a refund, they receive their gross pledge minus all pledge-time fees (platform percentage + gateway + protocol). Tips are not refundable.

```solidity
// Calculation from claimRefund
uint256 amountToRefund = s_tokenToPledgedAmount[tokenId];
uint256 paymentFee = s_tokenToPaymentFee[tokenId]; // includes platform %, gateway, protocol
uint256 netRefundAmount = amountToRefund - paymentFee;
```

## 5. Update Functions and Campaign Modifications

### A. Campaign Parameter Updates

- `updateDeadline(newDeadline)`

  - Caller: Platform Admin OR Campaign Owner
  - Timing: Only before `deadline - configLockPeriod`
  - Purpose: Extends or modifies the campaign deadline
  - Validation: New deadline must be after launch time and in the future

- `updateGoalAmount(newAmount)`
  - Caller: Platform Admin OR Campaign Owner
  - Timing: Only before `deadline - configLockPeriod`
  - Purpose: Modifies the funding goal amount
  - Validation: `newAmount > 0`

### B. Reward Management Updates

- `addRewards(rewardNames, rewards)`

  - Caller: Campaign Owner only
  - Timing: During active campaign (not paused/cancelled)
  - Purpose: Adds new primary tiers or add-ons
  - Validation: Non-zero values, consistent item arrays, no duplicates

- `removeReward(rewardName)`
  - Caller: Campaign Owner only
  - Timing: During active campaign (not paused/cancelled)
  - Purpose: Removes a reward option; existing pledges unaffected

### C. Administrative Updates

- `approveWithdrawal()`

  - Caller: Platform Admin only
  - Timing: Any time after configuration
  - Purpose: One-time activation of withdrawal functionality
  - Effect: Irreversible

- Treasury State Management:
  - `pauseTreasury(message)`: Platform Admin pauses operations
  - `unpauseTreasury(message)`: Platform Admin resumes operations
  - `cancelTreasury(message)`: Platform Admin OR Campaign Owner cancels campaign (overridden to allow both)

### D. Fee Configuration Updates

- `setPaymentGatewayFee(pledgeId, fee)`
  - Caller: Platform Admin only
  - Timing: Should be set before the corresponding pledge; setting after has no effect for past pledges
  - Purpose: Sets the gateway fee for a specific `pledgeId`
  - Scope: Applies only to that `pledgeId` (combined with caller address when processed)

## 6. Getters and Views

- `getWithdrawalApprovalStatus() -> bool`
- `getReward(bytes32 rewardName) -> Reward`
- `getRaisedAmount() -> uint256`
- `getAvailableRaisedAmount() -> uint256`
- `getLaunchTime() -> uint256`
- `getDeadline() -> uint256`
- `getGoalAmount() -> uint256`
- `getPaymentGatewayFee(bytes32 pledgeId) -> uint256`
- `getFeeValue(bytes32 feeKey) -> uint256`

Note: The interface-mandated `withdraw()` (no args) reverts in `KeepWhatsRaised`. Use `withdraw(uint256 amount)` according to the rules above.

## 7. Events and IDs

- Campaign creation: `CampaignInfoFactoryCampaignCreated(bytes32 identifierHash, address campaign)`
- Treasury deployment: `TreasuryFactoryTreasuryDeployed(bytes32 platformHash, uint256 implementationId, address info, address clone)`
- Treasury configuration: `TreasuryConfigured(Config, CampaignData, FeeKeys, FeeValues)`
- Pledge receipt: `Receipt(backer, reward, pledgeAmountNet, tip, tokenId, rewards)`
- Rewards added/removed: `RewardsAdded`, `RewardRemoved`
- Withdrawal: `WithdrawalWithFeeSuccessful(to, amountTransferred, totalFee)`
- Tips/funds claimed: `TipClaimed`, `FundClaimed`
- Gateway fee set: `KeepWhatsRaisedPaymentGatewayFeeSet(pledgeId, fee)`
- Deadline/goal updated: `KeepWhatsRaisedDeadlineUpdated`, `KeepWhatsRaisedGoalAmountUpdated`

Pledge ID scope: Internally, `internalPledgeId = keccak256(abi.encodePacked(pledgeId, msg.sender))` prevents re-use by the same caller. Different callers may reuse the same `pledgeId` without conflict.
