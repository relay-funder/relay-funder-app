# KeepWhatsRaised Treasury Contract Documentation

This document outlines the usage flow and technical specifications for the KeepWhatsRaised treasury smart contract.

## Main Function Flow

1. `enlistPlatform` → Platform registered in protocol
2. `registerTreasuryImplementation` → KeepWhatsRaised implementation registered
3. `approveTreasuryImplementation` → Implementation approved for use
4. `addPlatformData` → Fee structure keys added
5. `createCampaign` → emits `CampaignCreated` → extract `campaignAddress`
6. `deploy` → emits `TreasuryDeployed` → extract `treasuryAddress`
7. `configureTreasury` → Treasury operational parameters set
8. `addRewards` → Reward tiers created for backers
9. `approveWithdrawal` → Withdrawal functionality enabled
10. `setPaymentGatewayFee` → Gateway fee set for specific pledge
11. `pledgeForAReward` / `pledgeWithoutAReward` → Backer makes pledge → NFT minted
12. `withdraw` → Creator withdraws funds with fees applied
13. `claimRefund` → Backer claims refund → NFT burned
14. `claimTip` → Platform admin collects tips
15. `claimFund` → Platform admin claims remaining funds
16. `disburseFees` → Platform and protocol fees distributed

## 1. Deployment Flow

### A. Core Contract Deployment

The following contracts must be deployed in order:

- **TestToken** - ERC20 token for the platform
- **GlobalParams** - Protocol-wide parameters and admin management
- **CampaignInfo** - Individual campaign information contract (implementation)
- **TreasuryFactory** - Factory for deploying treasury instances
- **CampaignInfoFactory** - Factory for creating campaign information contracts
- **KeepWhatsRaised** - Treasury implementation contract

```javascript
// Example deployment sequence
testToken = new TestToken('TestToken', 'TST');
globalParams = new GlobalParams(protocolAdmin, testToken, protocolFeePercent);
campaignInfo = new CampaignInfo(address(this));
treasuryFactory = new TreasuryFactory(GlobalParams(globalParams));
campaignInfoFactory = new CampaignInfoFactory(
  GlobalParams(globalParams),
  campaignInfo,
);
keepWhatsRaisedImplementation = new KeepWhatsRaised();
```

### B. System Setup and Configuration

After deployment, the following setup steps must be performed by the Protocol Admin:

- **Enlist Platform**: Register the platform in the global parameters

  ```javascript
  GlobalParams(globalParams).enlistPlatform(
    platformHash,
    platformAdminAddress,
    platformFeePercent,
  );
  ```

- **Register Treasury Implementation**: Register the KeepWhatsRaised implementation with the factory.

  ```javascript
  TreasuryFactory(treasuryFactory).registerTreasuryImplementation(
    platformHash,
    0,
    keepWhatsRaisedImplementation,
  );
  ```

- **Approve Treasury Implementation**: Approve the implementation for use

  ```javascript
  TreasuryFactory(treasuryFactory).approveTreasuryImplementation(
    platformHash,
    0,
  );
  ```

- **Add Platform Data Keys**: Register the fee structure keys for the platform

  ```javascript
  GlobalParams(globalParams).addPlatformData(platformHash, PLATFORM_FEE_KEY);
  GlobalParams(globalParams).addPlatformData(platformHash, FLAT_FEE_KEY);
  GlobalParams(globalParams).addPlatformData(
    platformHash,
    CUMULATIVE_FLAT_FEE_KEY,
  );
  ```

- **Transfer Admin Rights**: Transfer control to the designated administrators
  ```javascript
  GlobalParams(globalParams).updateProtocolAdminAddress(finalProtocolAdmin);
  GlobalParams(globalParams).updatePlatformAdminAddress(
    platformHash,
    finalPlatformAdmin,
  );
  ```

## 2. Campaign Creation and Treasury Setup

### A. Campaign Creation

The Campaign Owner creates a new campaign through the CampaignInfoFactory:

```javascript
// Campaign creation example
bytes32 platformHash = 0x0000000000000000000000000000000000000000000000000000000000000000; // Akashic platform
bytes32 identifierHash = keccak256(abi.encodePacked("My Campaign"));
bytes32[] memory selectedPlatformHash = [platformHash];

// Platform data keys and values for fee configuration
bytes32[] memory platformDataKeys = [
    0x0000000000000000000000000000000000000000000000000000000000000000, // Platform Fee Key
    0x0000000000000000000000000000000000000000000000000000000000000000, // Flat Fee Key
    0x0000000000000000000000000000000000000000000000000000000000000000  // Cumulative Fee Key
];

bytes32[] memory platformDataValues = [
    bytes32(1000),   // 10% platform fee
    bytes32(100e18), // 100 token flat fee
    bytes32(200e18)  // 200 token cumulative fee
];

// Create the campaign
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

The Platform Admin deploys a treasury instance for the campaign:

```javascript
// Treasury deployment example
treasuryFactory.deploy(
  0x0000000000000000000000000000000000000000000000000000000000000000, // Akashic platform hash
  campaignAddress, // Address of the CampaignInfo contract
  0, // Treasury implementation ID (KeepWhatsRaised)
  'NAME', // ERC721 Name
  'SYMBOL', // ERC721 Symbol
);
```

### C. Treasury Configuration

The Platform Admin configures the deployed treasury with operational parameters:

```javascript
// Treasury configuration example
KeepWhatsRaised.Config memory _config = KeepWhatsRaised.Config({
    minimumWithdrawalForFeeExemption: 50_000e18,
    withdrawalDelay: 7 days,
    refundDelay: 14 days,
    configLockPeriod: 2 days,
    isColombianCreator: false
});

// Fee keys configuration
KeepWhatsRaised.FeeKeys memory feeKeys = KeepWhatsRaised.FeeKeys({
    flatFeeKey: 0x0000000000000000000000000000000000000000000000000000000000000000,
    cumulativeFlatFeeKey: 0x0000000000000000000000000000000000000000000000000000000000000000,
    grossPercentageFeeKeys: [0x0000000000000000000000000000000000000000000000000000000000000000]
});

// Finalize treasury setup
keepWhatsRaised.configureTreasury(_config, CAMPAIGN_DATA, feeKeys);
```

## 3. Campaign Lifecycle and Usage

### A. Active Campaign (Funding Period)

During the active funding period, between the `launchTime` and `deadline`, the contract can accept pledges.

- **Reward Management**: The Campaign Owner can add or remove reward tiers using `addRewards` and `removeReward`. Rewards can be primary pledge tiers (`isRewardTier: true`) or add-ons (`isRewardTier: false`). Each reward has a value and can contain multiple items with their own values and quantities.

- **Withdrawal Approval**: The Platform Admin must call `approveWithdrawal` to enable withdrawal functionality for the campaign owner.

- **Pledging**: A backer makes a pledge, transferring funds to the treasury and receiving an NFT receipt.

  1. `pledgeForAReward`: The backer pledges for one or more predefined rewards. The total pledge amount is derived from the sum of the rewards' values. An optional tip can be included. The first reward selected must be a primary reward tier.
  2. `pledgeWithoutAReward`: The backer contributes a custom `pledgeAmount` without selecting a reward, and can also add a tip.

- **Facilitating Pledges (Platform Admin)**:

  1. The admin can call `setPaymentGatewayFee` to assign a specific gateway fee to a unique `pledgeId` before the pledge occurs.
  2. The `setFeeAndPledge` function allows the admin to set this fee and execute a pledge on behalf of a backer in a single transaction.

- **Pledging Flow**: A pledge is a two-step process for the backer:
  1. **Approve Tokens**: The backer must first call `approve()` on the ERC20 token contract.
  2. **Call Pledge Function**: After approval, the backer (or an admin) calls the pledge function.

```javascript
// Example of a backer pledging 1000 tokens without a reward
uint256 pledgeAmount = 1000e18;
uint256 tipAmount = 10e18;
bytes32 pledgeId = keccak256("NEW_PLEDGE");

// Step 1: Backer approves the token transfer
vm.startPrank(backerAddress);
testToken.approve(address(keepWhatsRaised), pledgeAmount + tipAmount);
vm.stopPrank();

// Step 2: Pledge function is called
keepWhatsRaised.pledgeWithoutAReward(pledgeId, backerAddress, pledgeAmount, tipAmount);
```

### B. Post-Campaign (After Deadline or Cancellation)

Once the campaign ends, the contract's functions shift to fund distribution.

- **Withdrawing Funds (Campaign Owner)**:

  - The Campaign Owner can call `withdraw(uint256 amount)`.
  - **Partial Withdrawal**: If called before the deadline, the owner can withdraw a specified amount.
  - **Full Withdrawal**: If called after the deadline with `amount = 0`, the owner withdraws the entire remaining available balance.

- **Refunding Pledges (Backers)**:

  - Backers can claim a refund by calling `claimRefund(uint256 tokenId)`. This burns their pledge NFT.
  - The refund window is active after the campaign deadline or cancellation, but before the `refundDelay` period ends.

- **Claiming Funds (Platform Admin)**:

  - `claimTip`: After the deadline or cancellation, the Platform Admin can collect all tips contributed by backers.
  - `claimFund`: If the Campaign Owner does not withdraw funds after the `withdrawalDelay` (or `refundDelay` if cancelled) has passed, the Platform Admin can claim the remaining available funds in the treasury.

- **Fee Disbursement**:
  - The `disburseFees` function sends the accumulated platform and protocol fees to their respective admin wallets.

## 4. Fee Structure and Calculations

### A. Fees at Pledge Time

When a pledge is made, several fees are calculated upfront and deducted from the gross pledge amount to determine the net amount available for the creator.

- **Percentage-Based Fees**: The system calculates a series of percentage-based fees (e.g., platform fee, commission) based on the gross pledge amount using the keys specified in `grossPercentageFeeKeys`.

```javascript
// Inside _calculateNetAvailable function
for (uint256 i = 0; i < len; i++) {
    uint256 fee = (pledgeAmount * uint256(INFO.getPlatformData(s_feeKeys.grossPercentageFeeKeys[i]))) / PERCENT_DIVIDER;
    s_platformFee += fee;
    totalFee += fee;
}
```

- **Payment Gateway Fee**: A fixed, per-transaction fee, which is set by the platform admin for the specific pledge using `setPaymentGatewayFee`.

- **Net Calculation**: The sum of these fees is subtracted from the original pledge. This net amount is what becomes available for withdrawal, and the total fee is stored against the backer's NFT for potential refunds.

- **Example**: A backer pledges 1,000 tokens with a 40-token gateway fee and configured percentage fees of 10% (platform) and 6% (commission).
  - Percentage Fees = (1000 _ 10%) + (1000 _ 6%) = 160 tokens.
  - Gateway Fee = 40 tokens.
  - Total Fee Deducted = 160 + 40 = 200 tokens.
  - Net Amount Added to `s_availablePledgedAmount` = 1000 - 200 = 800 tokens.

### B. Fees at Withdrawal Time

When the creator withdraws funds, a separate set of fees is applied to the amount being withdrawn.

- **Flat Fees**: These fees depend on the withdrawal amount relative to the `minimumWithdrawalForFeeExemption` threshold.

  - **Partial Withdrawal (before deadline)**: Withdrawing an amount less than the exemption threshold incurs the `cumulativeFlatFeeKey` fee. Withdrawing an amount above the threshold incurs the standard `flatFeeKey` fee.
  - **Full Withdrawal (after deadline)**: If the total available fund is less than the exemption threshold, the `flatFeeKey` fee is charged. If the fund is larger, this flat fee is waived entirely.

- **Protocol Fee**: A percentage-based fee is always deducted from the withdrawal amount for the underlying protocol.

- **Colombian Creator Tax**: If the creator is marked as Colombian (`isColombianCreator: true`), an additional tax is deducted from the withdrawal amount after other fees have been accounted for. The calculation, `(availableBeforeTax * 40) / 10040`, approximates a 0.4% effective tax rate.

```javascript
// Simplified logic inside the withdraw function
if (s_config.isColombianCreator) {
    // This calculation approximates a 0.4% effective tax rate
    uint256 colombianCreatorTax = (availableBeforeTax * 40) / 10040;
    totalFee += colombianCreatorTax;
}
```

### C. Fees during Refund

If a backer claims a refund, they do not receive their full pledge amount.

- **Refund Amount**: The backer receives their original gross pledge amount minus the sum of all fees (percentage and gateway) that were calculated when they first made the pledge. The backer effectively absorbs the cost of the initial transaction fees. Tips are not refundable.

```javascript
// Calculation from claimRefund function
// Original gross pledge
uint256 amountToRefund = s_tokenToPledgedAmount[tokenId];
// Total fees from pledge time
uint256 paymentFee = s_tokenToPaymentFee[tokenId];
uint256 netRefundAmount = amountToRefund - paymentFee;
```

## 5. Update Functions and Campaign Modifications

### A. Campaign Parameter Updates

- **`updateDeadline(newDeadline)`**

  - **Caller**: Platform Admin OR Campaign Owner
  - **Timing Restriction**: Only allowed before `deadline - configLockPeriod`
  - **Purpose**: Extends or modifies the campaign deadline
  - **Validation**: New deadline must be after the launch time

- **`updateGoalAmount(newAmount)`**
  - **Caller**: Platform Admin OR Campaign Owner
  - **Timing Restriction**: Only allowed before `deadline - configLockPeriod`
  - **Purpose**: Modifies the funding goal amount
  - **Validation**: New goal amount must be greater than zero

### B. Reward Management Updates

- **`addRewards(rewardNames, rewards)`**

  - **Caller**: Campaign Owner only
  - **Timing**: Can be called throughout the campaign period
  - **Purpose**: Adds new reward tiers or add-ons for backers to select
  - **Validation**: Rewards must have non-zero values, no duplicate names allowed

- **`removeReward(rewardName)`**
  - **Caller**: Campaign Owner only
  - **Timing**: Can be called throughout the campaign period
  - **Purpose**: Removes reward options (typically unused rewards)
  - **Note**: Does not affect existing pledges that selected the removed reward

### C. Administrative Updates

- **`approveWithdrawal()`**

  - **Caller**: Platform Admin only
  - **Timing**: Can be called at any time after treasury configuration
  - **Purpose**: One-time activation of withdrawal functionality
  - **Effect**: Irreversible - once approved, cannot be revoked

- **Treasury State Management**:
  - `pauseTreasury(message)`: Platform Admin can pause all treasury operations
  - `unpauseTreasury(message)`: Platform Admin can resume treasury operations
  - `cancelTreasury(message)`: Platform Admin OR Campaign Owner can cancel the campaign

### D. Fee Configuration Updates

- **`setPaymentGatewayFee(pledgeId, fee)`**
  - **Caller**: Platform Admin only
  - **Timing**: Must be called before the corresponding pledge is made
  - **Purpose**: Sets or updates the gateway fee for a specific pledge
  - **Scope**: Fee applies only to the specified pledge ID
