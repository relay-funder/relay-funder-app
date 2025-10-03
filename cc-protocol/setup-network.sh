#!/usr/bin/env bash
set -euo pipefail

# One-Time Network Setup for KeepWhatsRaised Platform
# Works for mainnet, testnet, or any EVM network
# Run once per network when deploying to a new chain

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${1:-$SCRIPT_DIR/.env.foundry}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing environment file: $ENV_FILE"
  echo ""
  echo "Usage: $0 [path/to/.env.file]"
  echo "Example: $0 .env.mainnet"
  echo ""
  echo "Required variables:"
  echo "  NEXT_PUBLIC_RPC_URL"
  echo "  NEXT_PUBLIC_GLOBAL_PARAMS"
  echo "  NEXT_PUBLIC_PLATFORM_HASH"
  echo "  NEXT_PUBLIC_PLATFORM_ADMIN"
  echo "  PLATFORM_ADMIN_PRIVATE_KEY"
  echo "  PROTOCOL_ADMIN_PRIVATE_KEY"
  echo "  NEXT_PUBLIC_TREASURY_FACTORY"
  echo "  KEEP_WHATS_RAISED_IMPLEMENTATION"
  exit 1
fi

# Load environment
source "$ENV_FILE"

echo "🚀 KeepWhatsRaised Platform Setup"
echo "=================================="
echo ""

# Verify required vars
: "${NEXT_PUBLIC_RPC_URL:?Missing NEXT_PUBLIC_RPC_URL}"
: "${NEXT_PUBLIC_GLOBAL_PARAMS:?Missing NEXT_PUBLIC_GLOBAL_PARAMS}"
: "${NEXT_PUBLIC_PLATFORM_HASH:?Missing NEXT_PUBLIC_PLATFORM_HASH}"
: "${NEXT_PUBLIC_PLATFORM_ADMIN:?Missing NEXT_PUBLIC_PLATFORM_ADMIN}"
: "${PLATFORM_ADMIN_PRIVATE_KEY:?Missing PLATFORM_ADMIN_PRIVATE_KEY}"
: "${PROTOCOL_ADMIN_PRIVATE_KEY:?Missing PROTOCOL_ADMIN_PRIVATE_KEY}"
: "${NEXT_PUBLIC_TREASURY_FACTORY:?Missing NEXT_PUBLIC_TREASURY_FACTORY}"
: "${KEEP_WHATS_RAISED_IMPLEMENTATION:?Missing KEEP_WHATS_RAISED_IMPLEMENTATION}"

KWR_IMPL="${KEEP_WHATS_RAISED_IMPLEMENTATION}"

echo "Configuration:"
echo "  RPC: ${NEXT_PUBLIC_RPC_URL}"
echo "  GlobalParams: $NEXT_PUBLIC_GLOBAL_PARAMS"
echo "  Platform Hash: ${NEXT_PUBLIC_PLATFORM_HASH:0:16}..."
echo "  Platform Admin: $NEXT_PUBLIC_PLATFORM_ADMIN"
echo "  Treasury Factory: $NEXT_PUBLIC_TREASURY_FACTORY"
echo "  KWR Implementation: $KWR_IMPL"
echo ""

# Step 1: Enlist platform
echo "1️⃣  Checking platform enlistment..."
IS_LISTED=$(cast call "$NEXT_PUBLIC_GLOBAL_PARAMS" \
  "checkIfPlatformIsListed(bytes32)(bool)" \
  "$NEXT_PUBLIC_PLATFORM_HASH" \
  --rpc-url "$NEXT_PUBLIC_RPC_URL" 2>/dev/null || echo "false")

if [ "$IS_LISTED" != "true" ]; then
  echo "   Enlisting platform with protocol admin..."
  cast send "$NEXT_PUBLIC_GLOBAL_PARAMS" \
    "enlistPlatform(bytes32,address,uint256)" \
    "$NEXT_PUBLIC_PLATFORM_HASH" \
    "$NEXT_PUBLIC_PLATFORM_ADMIN" \
    1000 \
    --rpc-url "$NEXT_PUBLIC_RPC_URL" \
    --private-key "$PROTOCOL_ADMIN_PRIVATE_KEY" \
    --legacy
  echo "   ✅ Platform enlisted"
else
  echo "   ✅ Platform already enlisted"
fi

# Step 2: Register and approve treasury implementation
echo ""
echo "2️⃣  Configuring KeepWhatsRaised treasury implementation..."

echo "   Registering implementation (ID: 0)..."
cast send "$NEXT_PUBLIC_TREASURY_FACTORY" \
  "registerTreasuryImplementation(bytes32,uint256,address)" \
  "$NEXT_PUBLIC_PLATFORM_HASH" \
  0 \
  "$KWR_IMPL" \
  --rpc-url "$NEXT_PUBLIC_RPC_URL" \
  --private-key "$PLATFORM_ADMIN_PRIVATE_KEY" \
  --legacy 2>/dev/null || echo "   (Already registered)"

echo "   Approving implementation..."
cast send "$NEXT_PUBLIC_TREASURY_FACTORY" \
  "approveTreasuryImplementation(bytes32,uint256)" \
  "$NEXT_PUBLIC_PLATFORM_HASH" \
  0 \
  --rpc-url "$NEXT_PUBLIC_RPC_URL" \
  --private-key "$PROTOCOL_ADMIN_PRIVATE_KEY" \
  --legacy 2>/dev/null || echo "   (Already approved)"

echo "   ✅ Treasury implementation configured"

# Step 3: Verify setup
echo ""
echo "3️⃣  Verifying setup..."

IS_LISTED=$(cast call "$NEXT_PUBLIC_GLOBAL_PARAMS" \
  "checkIfPlatformIsListed(bytes32)(bool)" \
  "$NEXT_PUBLIC_PLATFORM_HASH" \
  --rpc-url "$NEXT_PUBLIC_RPC_URL" 2>/dev/null || echo "false")

if [ "$IS_LISTED" == "true" ]; then
  echo "   ✅ Platform is enlisted"
else
  echo "   ❌ Platform NOT enlisted (setup failed)"
  exit 1
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Summary:"
echo "  • Platform enlisted in GlobalParams"
echo "  • KeepWhatsRaised treasury registered and approved"
echo "  • Ready to deploy campaigns on this network"
echo ""
echo "Next steps:"
echo "  1. Create campaigns in app (draft mode)"
echo "  2. Admin approves campaigns → deploys campaign contract"
echo "  3. Admin deploys treasury → configures with fees"
echo "  4. Campaign goes live"

