#!/usr/bin/env bash
set -euo pipefail

# KeepWhatsRaised Treasury Flow Test using Foundry cast against CCP staging deployment
# Tests complete KeepWhatsRaised campaign lifecycle: creation, pledging, and withdrawal
# This script focuses exclusively on KeepWhatsRaised treasury testing (implementation ID 0)
# Prereqs: cast, jq, python3 available in PATH

RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Setup Foundry PATH
setup_foundry() {
    local foundry_paths=(
        "$HOME/.foundry/bin"
        "/usr/local/bin"
        "/opt/homebrew/bin"
        "$HOME/.cargo/bin"
        "/usr/bin"
        "/bin"
    )

    # Check if cast is already available
    if command -v cast &> /dev/null; then
        echo -e "${BLUE}✓ Foundry cast command found in PATH${NC}"

        # Optional: Check Foundry version for compatibility
        if command -v forge &> /dev/null; then
            local forge_version
            forge_version=$(forge --version 2>/dev/null | head -n1 || echo "unknown")
            echo -e "${BLUE}✓ Foundry version: $forge_version${NC}"
        fi

        return 0
    fi

    # Try to find Foundry in common installation locations
    for foundry_path in "${foundry_paths[@]}"; do
        if [ -d "$foundry_path" ] && [ -x "$foundry_path/cast" ]; then
            export PATH="$foundry_path:$PATH"
            echo -e "${BLUE}✓ Added Foundry to PATH from: $foundry_path${NC}"

            # Verify cast is now accessible
            if command -v cast &> /dev/null; then
                echo -e "${BLUE}✓ Foundry cast command is now accessible${NC}"
                return 0
            fi
        fi
    done

    # If we get here, Foundry is not found
    echo -e "${RED}✗ Foundry not found in common locations. Please install Foundry:${NC}"
    echo ""
    echo "Installation options:"
    echo "1. Using foundryup (recommended):"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   source ~/.bashrc && foundryup"
    echo ""
    echo "2. Using Homebrew (macOS):"
    echo "   brew install foundry"
    echo ""
    echo "3. Manual installation:"
    echo "   Download from: https://github.com/foundry-rs/foundry/releases"
    echo ""
    echo -e "${RED}After installation, restart your terminal or run: source ~/.bashrc${NC}"
    exit 1
}

# Setup Foundry first
setup_foundry

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.foundry"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing KeepWhatsRaised test environment file: $ENV_FILE" >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required tool: $1" >&2; exit 1; }; }
require cast
require jq
require python3

RPC_URL="${NEXT_PUBLIC_RPC_URL:?NEXT_PUBLIC_RPC_URL not set}"

# Addresses and keys from env
CAMPAIGN_INFO_FACTORY="${NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY:?NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY not set}"
TREASURY_FACTORY="${NEXT_PUBLIC_TREASURY_FACTORY:?NEXT_PUBLIC_TREASURY_FACTORY not set}"
GLOBAL_PARAMS="${NEXT_PUBLIC_GLOBAL_PARAMS:?NEXT_PUBLIC_GLOBAL_PARAMS not set}"
USDT="${NEXT_PUBLIC_USDT_ADDRESS:?NEXT_PUBLIC_USDT_ADDRESS not set}"
USDT_DECIMALS="${NEXT_PUBLIC_USDT_DECIMALS:-6}"
PLATFORM_HASH="${NEXT_PUBLIC_PLATFORM_HASH:?NEXT_PUBLIC_PLATFORM_HASH not set}"
PLATFORM_ADMIN_ADDR="${NEXT_PUBLIC_PLATFORM_ADMIN:?NEXT_PUBLIC_PLATFORM_ADMIN not set}"

PLATFORM_ADMIN_PK="${PLATFORM_ADMIN_PRIVATE_KEY:?PLATFORM_ADMIN_PRIVATE_KEY not set}"
PROTOCOL_ADMIN_PK="${PROTOCOL_ADMIN_PRIVATE_KEY:?PROTOCOL_ADMIN_PRIVATE_KEY not set}"
CREATOR_PK="${CREATOR_PRIVATE_KEY:?CREATOR_PRIVATE_KEY not set}"
BACKER_PK="${BACKER_PRIVATE_KEY:?BACKER_PRIVATE_KEY not set}"

# Derive addresses for convenience (won't fail if RPC forbids eth_sign, so allow empty silently)
addr_of_pk() { cast wallet address "$1" 2>/dev/null || true; }
CREATOR_ADDR="${CREATOR_WALLET_ADDRESS:-$(addr_of_pk "$CREATOR_PK")}"
BACKER_ADDR="${BACKER_WALLET_ADDRESS:-$(addr_of_pk "$BACKER_PK")}"

echo "Using RPC: $RPC_URL"
echo "CampaignInfoFactory: $CAMPAIGN_INFO_FACTORY"
echo "TreasuryFactory:     $TREASURY_FACTORY"
echo "GlobalParams:        $GLOBAL_PARAMS"
echo "USDT:                $USDT (decimals=$USDT_DECIMALS)"
echo "Platform Hash:       $PLATFORM_HASH"
echo "Creator:             ${CREATOR_ADDR:-<derived from key>}"
echo "Backer:              ${BACKER_ADDR:-<derived from key>}"

# Helpers
keccak() { cast keccak "$1"; }

to_bytes32() {
  # decimal -> 0x-prefixed 32-byte hex
  python3 - "$1" <<'PY'
import sys
n = int(sys.argv[1])
print('0x' + n.to_bytes(32, 'big').hex())
PY
}

hex_to_dec() {
  python3 - "$1" <<'PY'
import sys
x = sys.argv[1]
print(int(x, 16))
PY
}

mul_pow10() {
  # multiply integer a by 10^b
  python3 - "$1" "$2" <<'PY'
import sys
a=int(sys.argv[1]); b=int(sys.argv[2])
print(a * (10 ** b))
PY
}

GOAL_AMOUNT_USDT=1   # 1 USDT goal (small for testing)
GOAL_AMOUNT=$(python3 -c "print(int($GOAL_AMOUNT_USDT * 10**$USDT_DECIMALS))")
# Ensure a unique identifier each run to avoid collisions
ID_SUFFIX="$RANDOM$RANDOM"
IDENTIFIER="$(cast keccak "CCP Demo $(date -u +%Y-%m-%dT%H:%M:%SZ)-$ID_SUFFIX")"

# Platform data keys
FLAT_FEE_KEY=$(keccak "flatFee")
CUM_FLAT_FEE_KEY=$(keccak "cumulativeFlatFee")
PLATFORM_FEE_KEY=$(keccak "platformFee")
VAKI_COMMISSION_KEY=$(keccak "vakiCommission")

# Platform data values (bytes32-encoded numbers)
# Using ZERO fees to match the platform configuration (no fees during testing)
# Fee amounts are in USDT base units (6 decimals)
FLAT_FEE_AMOUNT=0                                               # 0 USDT flat fee
CUM_FLAT_FEE_AMOUNT=0                                           # 0 USDT cumulative flat fee
PLATFORM_FEE_BPS=0                                              # 0% platform fee (no basis points fee)
VAKI_COMMISSION_BPS=0                                           # 0% VAKI commission

FLAT_FEE_VALUE=$(to_bytes32 "$FLAT_FEE_AMOUNT")
CUM_FLAT_FEE_VALUE=$(to_bytes32 "$CUM_FLAT_FEE_AMOUNT")
PLATFORM_FEE_VALUE=$(to_bytes32 "$PLATFORM_FEE_BPS")
VAKI_COMMISSION_VALUE=$(to_bytes32 "$VAKI_COMMISSION_BPS")

echo "Ensuring platform and data keys are set..."
# Enlist platform if not already listed
IS_LISTED=$(cast call "$GLOBAL_PARAMS" "checkIfPlatformIsListed(bytes32)(bool)" "$PLATFORM_HASH" --rpc-url "$RPC_URL" || echo false)
if [[ "$IS_LISTED" != "true" ]]; then
  echo "Enlisting platform..."
  cast send "$GLOBAL_PARAMS" \
    "enlistPlatform(bytes32,address,uint256)" \
    "$PLATFORM_HASH" "${NEXT_PUBLIC_PLATFORM_ADMIN:?NEXT_PUBLIC_PLATFORM_ADMIN not set}" 1000 \
    --rpc-url "$RPC_URL" --private-key "$PROTOCOL_ADMIN_PK" --legacy || true
  # Re-check
  IS_LISTED=$(cast call "$GLOBAL_PARAMS" "checkIfPlatformIsListed(bytes32)(bool)" "$PLATFORM_HASH" --rpc-url "$RPC_URL" || echo false)
fi
if [[ "$IS_LISTED" != "true" ]]; then
  echo "Platform is not listed in GlobalParams and could not be enlisted with provided PROTOCOL_ADMIN key."
  echo "Ask CCP to enlist platform or provide correct PROTOCOL_ADMIN_PRIVATE_KEY. Aborting."
  exit 1
fi

# Platform data keys - kept for compatibility with existing deployments
# Fee values are stored directly in each treasury contract via configureTreasury
for KEY in "$FLAT_FEE_KEY" "$CUM_FLAT_FEE_KEY" "$PLATFORM_FEE_KEY" "$VAKI_COMMISSION_KEY"; do
  IS_VALID=$(cast call "$GLOBAL_PARAMS" "checkIfPlatformDataKeyValid(bytes32)(bool)" "$KEY" --rpc-url "$RPC_URL" || echo false)
  if [[ "$IS_VALID" != "true" ]]; then
    echo "Adding platform data key: $KEY"
    cast send "$GLOBAL_PARAMS" "addPlatformData(bytes32,bytes32)" "$PLATFORM_HASH" "$KEY" \
      --rpc-url "$RPC_URL" --private-key "$PLATFORM_ADMIN_PK" --legacy || true
    # Verify
    IS_VALID=$(cast call "$GLOBAL_PARAMS" "checkIfPlatformDataKeyValid(bytes32)(bool)" "$KEY" --rpc-url "$RPC_URL" || echo false)
    if [[ "$IS_VALID" != "true" ]]; then
      echo "Failed to set platform data key $KEY. Ensure PLATFORM_ADMIN_PRIVATE_KEY matches platform admin for the hash. Aborting."
      exit 1
    fi
  fi
done

# Register and approve KeepWhatsRaised implementation (implementation ID 0)
KWR_IMPLEMENTATION_ID=${KEEP_WHATS_RAISED_IMPLEMENTATION_ID:-0}
if [[ -n "${KEEP_WHATS_RAISED_IMPLEMENTATION:-}" ]]; then
  echo "Registering KWR implementation (id=$KWR_IMPLEMENTATION_ID)..."
  cast send "$TREASURY_FACTORY" \
    "registerTreasuryImplementation(bytes32,uint256,address)" \
    "$PLATFORM_HASH" "$KWR_IMPLEMENTATION_ID" "$KEEP_WHATS_RAISED_IMPLEMENTATION" \
    --rpc-url "$RPC_URL" --private-key "$PLATFORM_ADMIN_PK" --legacy || true

  echo "Approving KWR implementation..."
  cast send "$TREASURY_FACTORY" \
    "approveTreasuryImplementation(bytes32,uint256)" \
    "$PLATFORM_HASH" "$KWR_IMPLEMENTATION_ID" \
    --rpc-url "$RPC_URL" --private-key "$PROTOCOL_ADMIN_PK" --legacy || true
fi

echo "Creating campaign..."
# Recompute timing just before creation to avoid drift
now_hex=$(cast block latest --rpc-url "$RPC_URL" --json | jq -r .timestamp)
now_dec=$(hex_to_dec "${now_hex#0x}")
LAUNCH_OFFSET_SEC=20
CAMPAIGN_DURATION_SEC=$((120))
LAUNCH_TIME=$((now_dec + LAUNCH_OFFSET_SEC))
DEADLINE=$((LAUNCH_TIME + CAMPAIGN_DURATION_SEC))

cast send "$CAMPAIGN_INFO_FACTORY" \
  "createCampaign(address,bytes32,bytes32[],bytes32[],bytes32[],(uint256,uint256,uint256))" \
  "$CREATOR_ADDR" \
  "$IDENTIFIER" \
  "[$PLATFORM_HASH]" \
  "[]" \
  "[]" \
  "($LAUNCH_TIME,$DEADLINE,$GOAL_AMOUNT)" \
  --rpc-url "$RPC_URL" \
  --private-key "$CREATOR_PK" --legacy >/tmp/cif_tx.txt

CIF_TX_HASH=$(grep -m1 -E '^transactionHash' /tmp/cif_tx.txt | awk '{print $2}' | tr -d '\r') || true
# Extract campaign address from factory event logs (CampaignInfoFactoryCampaignCreated)
CAMPAIGN_ADDR=$(cast receipt "$CIF_TX_HASH" --rpc-url "$RPC_URL" --json \
  | jq -r --arg addr "$(echo "$CAMPAIGN_INFO_FACTORY" | tr '[:upper:]' '[:lower:]')" \
    '.logs[] | select(.address|ascii_downcase==$addr)
     | select(.topics[0] == "0x2102d36566d724f06d3e007e54c23578d1369e01113ce1ea23d2c24647f6dcd6")
     | .topics[2]' \
  | head -n1 \
  | sed 's/0x000000000000000000000000/0x/')

if [[ -z "${CAMPAIGN_ADDR:-}" || "$CAMPAIGN_ADDR" == "0x" ]]; then
  echo "Failed to extract campaign address from creation receipt. Aborting."
  exit 1
fi
echo "Campaign deployed at: $CAMPAIGN_ADDR"

echo "Deploying KeepWhatsRaised treasury..."
# KeepWhatsRaised uses implementation ID 0
KWR_IMPLEMENTATION_ID=${KEEP_WHATS_RAISED_IMPLEMENTATION_ID:-0}
# Use explicit pending nonce for platform admin to avoid sequencer race
sleep 1
PLAT_NONCE_HEX=$(cast rpc eth_getTransactionCount "$PLATFORM_ADMIN_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
PLAT_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${PLAT_NONCE_HEX#0x}")
cast send "$TREASURY_FACTORY" \
  "deploy(bytes32,address,uint256,string,string)" \
  "$PLATFORM_HASH" "$CAMPAIGN_ADDR" "$KWR_IMPLEMENTATION_ID" "Demo" "DMO" \
  --rpc-url "$RPC_URL" \
  --private-key "$PLATFORM_ADMIN_PK" --nonce "$PLAT_NONCE" --legacy >/tmp/tf_tx.txt

TF_TX_HASH=$(grep "transactionHash" /tmp/tf_tx.txt | tail -n1 | awk '{print $2}' | tr -d '\r')
if [[ -z "$TF_TX_HASH" ]]; then
  echo "Failed to extract treasury deployment tx hash. Output:"
  cat /tmp/tf_tx.txt
  exit 1
fi
echo "Treasury deployment tx: $TF_TX_HASH"

# Extract treasury address from event logs using topic signature
TREASURY_ADDR=$(cast receipt "$TF_TX_HASH" --rpc-url "$RPC_URL" --json \
  | jq -r '.logs[] | select(.topics[0] == "0xb8f945e292dd026d0d25c7d92385e71ad65d899a9f12c361c8021ef894a33bd6") | .data' \
  | head -n1 \
  | sed 's/0x000000000000000000000000/0x/')

if [[ -z "${TREASURY_ADDR:-}" ]]; then
  echo "Failed to resolve treasury address from receipt; aborting." >&2
  exit 1
fi
echo "Treasury deployed at: $TREASURY_ADDR"

echo "Configuring treasury..."
WITHDRAWAL_DELAY=3600  # 1 hour (short enough for testing)
REFUND_DELAY=7200      # 2 hours
CONFIG_LOCK_PERIOD=1800  # 30 minutes
IS_COLOMBIAN=false

# Wait for deployment transaction to be processed
sleep 2
# Fetch next pending nonce for configuration to avoid nonce-too-low error
CONFIG_NONCE_HEX=$(cast rpc eth_getTransactionCount "$PLATFORM_ADMIN_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
CONFIG_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${CONFIG_NONCE_HEX#0x}")

cast send "$TREASURY_ADDR" \
  "configureTreasury((uint256,uint256,uint256,uint256,bool),(uint256,uint256,uint256),(bytes32,bytes32,bytes32[]),(uint256,uint256,uint256[]))" \
  "($(python3 -c "print(int(0.5 * 10**$USDT_DECIMALS))"),$WITHDRAWAL_DELAY,$REFUND_DELAY,$CONFIG_LOCK_PERIOD,$IS_COLOMBIAN)" \
  "($LAUNCH_TIME,$DEADLINE,$GOAL_AMOUNT)" \
  "($FLAT_FEE_KEY,$CUM_FLAT_FEE_KEY,[$PLATFORM_FEE_KEY,$VAKI_COMMISSION_KEY])" \
  "($FLAT_FEE_AMOUNT,$CUM_FLAT_FEE_AMOUNT,[$PLATFORM_FEE_BPS,$VAKI_COMMISSION_BPS])" \
  --rpc-url "$RPC_URL" \
  --private-key "$PLATFORM_ADMIN_PK" --nonce "$CONFIG_NONCE" --legacy >/dev/null

echo "Waiting for campaign launch time..."
now_hex2=$(cast block latest --rpc-url "$RPC_URL" --json | jq -r .timestamp)
now_dec2=$(hex_to_dec "${now_hex2#0x}")
sleep_for=$((LAUNCH_TIME - now_dec2 + 5))
echo "Current time: $now_dec2, Launch time: $LAUNCH_TIME, Need to wait: $sleep_for seconds"
if (( sleep_for > 0 )); then
  echo "Waiting $sleep_for seconds for campaign launch..."
  for ((i=1; i<=sleep_for; i++)); do
    if (( i % 5 == 0 || i == sleep_for )); then
      echo "  ... $i/$sleep_for seconds elapsed"
    fi
    sleep 1
  done
  echo "Campaign should now be live!"
fi

PLEDGE_USDT=1.0                # 1.0 USDT pledge (provides enough funds for withdrawal with fees)
TIP_USDT=0
PLEDGE_AMOUNT=$(python3 -c "print(int($PLEDGE_USDT * 10**$USDT_DECIMALS))")
TIP_AMOUNT=$(python3 -c "print(int($TIP_USDT * 10**$USDT_DECIMALS))")
PLEDGE_ID="$(cast keccak "pledge-$(date +%s)")"

# Check backer balance before pledge
BACKER_BAL_BEFORE_RAW=$(cast call "$USDT" "balanceOf(address)(uint256)" "$BACKER_ADDR" --rpc-url "$RPC_URL")
BACKER_BAL_BEFORE=$(echo "$BACKER_BAL_BEFORE_RAW" | awk '{print $1}')
BACKER_BAL_BEFORE_DEC=$(python3 -c "print($BACKER_BAL_BEFORE / 10**$USDT_DECIMALS)")
echo "Backer USDT balance before pledge: $BACKER_BAL_BEFORE_DEC USDT"
echo "About to pledge: $PLEDGE_USDT USDT (+ $TIP_USDT tip)"

# Set payment gateway fee before pledge (required by KeepWhatsRaised)
# Gateway fee is 0 for this test, but the pledge ID must be registered
echo "Setting payment gateway fee for pledge..."
sleep 1
GATEWAY_FEE_NONCE_HEX=$(cast rpc eth_getTransactionCount "$PLATFORM_ADMIN_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
GATEWAY_FEE_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${GATEWAY_FEE_NONCE_HEX#0x}")
GATEWAY_FEE_AMOUNT=0  # No gateway fee for direct pledges in testing
cast send "$TREASURY_ADDR" \
  "setPaymentGatewayFee(bytes32,uint256)" \
  "$PLEDGE_ID" "$GATEWAY_FEE_AMOUNT" \
  --rpc-url "$RPC_URL" --private-key "$PLATFORM_ADMIN_PK" --nonce "$GATEWAY_FEE_NONCE" --legacy >/dev/null

echo "Approving USDT allowance from backer..."
sleep 1
APPROVE_NONCE_HEX=$(cast rpc eth_getTransactionCount "$BACKER_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
APPROVE_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${APPROVE_NONCE_HEX#0x}")
cast send "$USDT" "approve(address,uint256)" "$TREASURY_ADDR" "$((PLEDGE_AMOUNT + TIP_AMOUNT))" \
  --rpc-url "$RPC_URL" --private-key "$BACKER_PK" --nonce "$APPROVE_NONCE" --legacy >/dev/null

echo "Submitting pledge..."
# Small delay to let pending nonce update across RPC nodes
sleep 2

# Fetch next pending nonce to avoid nonce-too-low
BACKER_NONCE_HEX=$(cast rpc eth_getTransactionCount "$BACKER_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
BACKER_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${BACKER_NONCE_HEX#0x}")

cast send "$TREASURY_ADDR" \
  "pledgeWithoutAReward(bytes32,address,uint256,uint256)" \
  "$PLEDGE_ID" "$BACKER_ADDR" "$PLEDGE_AMOUNT" "$TIP_AMOUNT" \
  --rpc-url "$RPC_URL" --private-key "$BACKER_PK" --nonce "$BACKER_NONCE" --legacy >/dev/null

echo "Pledge submitted! Checking balances..."

# Check backer balance after pledge
BACKER_BAL_AFTER_RAW=$(cast call "$USDT" "balanceOf(address)(uint256)" "$BACKER_ADDR" --rpc-url "$RPC_URL")
BACKER_BAL_AFTER=$(echo "$BACKER_BAL_AFTER_RAW" | awk '{print $1}')
BACKER_BAL_AFTER_DEC=$(python3 -c "print($BACKER_BAL_AFTER / 10**$USDT_DECIMALS)")
echo "Backer USDT balance after pledge: $BACKER_BAL_AFTER_DEC USDT"

# Check treasury balances
TREASURY_TOTAL_RAW=$(cast call "$TREASURY_ADDR" "getRaisedAmount()(uint256)" --rpc-url "$RPC_URL")
TREASURY_TOTAL=$(echo "$TREASURY_TOTAL_RAW" | awk '{print $1}')
TREASURY_AVAILABLE_RAW=$(cast call "$TREASURY_ADDR" "getAvailableRaisedAmount()(uint256)" --rpc-url "$RPC_URL")
TREASURY_AVAILABLE=$(echo "$TREASURY_AVAILABLE_RAW" | awk '{print $1}')
TREASURY_TOTAL_DEC=$(python3 -c "print($TREASURY_TOTAL / 10**$USDT_DECIMALS)")
TREASURY_AVAILABLE_DEC=$(python3 -c "print($TREASURY_AVAILABLE / 10**$USDT_DECIMALS)")
echo "Treasury total raised: $TREASURY_TOTAL_DEC USDT"
echo "Treasury available for withdrawal: $TREASURY_AVAILABLE_DEC USDT"

# Check treasury USDT token balance
TREASURY_TOKEN_BAL_RAW=$(cast call "$USDT" "balanceOf(address)(uint256)" "$TREASURY_ADDR" --rpc-url "$RPC_URL")
TREASURY_TOKEN_BAL=$(echo "$TREASURY_TOKEN_BAL_RAW" | awk '{print $1}')
TREASURY_TOKEN_BAL_DEC=$(python3 -c "print($TREASURY_TOKEN_BAL / 10**$USDT_DECIMALS)")
echo "Treasury USDT token balance: $TREASURY_TOKEN_BAL_DEC USDT"

echo ""
echo "=== PLEDGE VERIFICATION COMPLETE ==="
echo "Press Enter to continue with withdrawal test, or Ctrl+C to stop here..."
read -r

OWNER_ADDR=$(cast call "$CAMPAIGN_ADDR" "owner()(address)" --rpc-url "$RPC_URL")
BAL_BEFORE=$(cast call "$USDT" "balanceOf(address)(uint256)" "$OWNER_ADDR" --rpc-url "$RPC_URL")

echo "Approving withdrawals (platform admin)..."
# Fetch fresh nonce for approval transaction
sleep 1
APPROVAL_NONCE_HEX=$(cast rpc eth_getTransactionCount "$PLATFORM_ADMIN_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
APPROVAL_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${APPROVAL_NONCE_HEX#0x}")
cast send "$TREASURY_ADDR" "approveWithdrawal()" \
  --rpc-url "$RPC_URL" --private-key "$PLATFORM_ADMIN_PK" --nonce "$APPROVAL_NONCE" --legacy >/dev/null

# Withdraw immediately after pledge (withdrawal window is before deadline + withdrawalDelay)
# NOTE: In KeepWhatsRaised, withdraw(0) is only valid AFTER deadline; before deadline you must pass amount > 0.
# Get current available amount for pre-deadline withdrawal
AVAILABLE_RAW=$(cast call "$TREASURY_ADDR" "getAvailableRaisedAmount()(uint256)" --rpc-url "$RPC_URL")
AVAILABLE_AMOUNT=$(echo "$AVAILABLE_RAW" | awk '{print $1}')

# For partial withdrawals before deadline with zero fees configured
# With zero fees, we can withdraw the full available amount
WITHDRAWAL_AMOUNT=$AVAILABLE_AMOUNT
echo "Available: $AVAILABLE_AMOUNT base units, Cumulative flat fee: $CUM_FLAT_FEE_AMOUNT base units (zero)"
echo "Withdrawing amount: $WITHDRAWAL_AMOUNT base units (full available amount with zero fees)"

if (( WITHDRAWAL_AMOUNT <= 0 )); then
  echo "WARNING: Not enough funds to cover withdrawal fees. Skipping withdrawal test."
  echo "To test withdrawal, increase pledge amount or reduce flat fees."
else
  # Fetch fresh nonce for creator's withdrawal transaction
  sleep 2
  WITHDRAW_NONCE_HEX=$(cast rpc eth_getTransactionCount "$CREATOR_ADDR" pending --rpc-url "$RPC_URL" | tr -d '"')
  WITHDRAW_NONCE=$(python3 -c 'import sys;print(int(sys.argv[1],16))' "${WITHDRAW_NONCE_HEX#0x}")
  echo "Executing withdrawal with creator account (nonce: $WITHDRAW_NONCE)..."
  cast send "$TREASURY_ADDR" "withdraw(uint256)" "$WITHDRAWAL_AMOUNT" \
    --rpc-url "$RPC_URL" --private-key "$CREATOR_PK" --nonce "$WITHDRAW_NONCE" --legacy >/dev/null
fi

if (( WITHDRAWAL_AMOUNT > 0 )); then
  BAL_AFTER_RAW=$(cast call "$USDT" "balanceOf(address)(uint256)" "$OWNER_ADDR" --rpc-url "$RPC_URL")
  BAL_AFTER=$(echo "$BAL_AFTER_RAW" | awk '{print $1}')
  AVAIL_AFTER_RAW=$(cast call "$TREASURY_ADDR" "getAvailableRaisedAmount()(uint256)" --rpc-url "$RPC_URL")
  AVAIL_AFTER=$(echo "$AVAIL_AFTER_RAW" | awk '{print $1}')

  BAL_BEFORE_CLEAN=$(echo "$BAL_BEFORE" | awk '{print $1}')
  delta=$((BAL_AFTER - BAL_BEFORE_CLEAN))
  delta_usdt=$(python3 -c "print($delta / 10**$USDT_DECIMALS)")
  echo ""
  echo "=== WITHDRAWAL RESULTS ==="
  echo "Creator received: $delta base units ($delta_usdt USDT)"
  echo "Treasury available after withdrawal: $AVAIL_AFTER base units"
  echo "Fees charged: $CUM_FLAT_FEE_AMOUNT base units (zero fees configured)"

  if (( delta > 0 )); then
    echo ""
    echo "✓ KeepWhatsRaised Flow OK: pledge, approval, and withdrawal executed successfully."
  else
    echo ""
    echo "✗ KeepWhatsRaised Flow WARNING: creator balance did not increase; inspect transactions above."
  fi
else
  echo ""
  echo "✗ Withdrawal test skipped due to insufficient funds."
fi

echo "KeepWhatsRaised test completed."
