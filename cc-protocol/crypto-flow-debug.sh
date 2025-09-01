#!/bin/bash

# Crypto-Only Flow Debugging Script for Akashic MVP
# Tests complete workflow: Campaign Creation → Admin Approval → Contribution → Balance Verification
# Integrates with existing application database and contract system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Setup Foundry PATH
setup_foundry() {
    # Add Foundry to PATH if not already available
    if ! command -v cast &> /dev/null; then
        if [ -d "$HOME/.foundry/bin" ]; then
            export PATH="$HOME/.foundry/bin:$PATH"
            echo -e "${BLUE}✓ Added Foundry to PATH${NC}"
        else
            echo -e "${RED}✗ Foundry not found. Please install Foundry:${NC}"
            echo "curl -L https://foundry.paradigm.xyz | bash"
            echo "source ~/.bashrc && foundryup"
            exit 1
        fi
    fi
}

# Load environment variables
load_environment() {
    if [ -f ../.env.local ]; then
        echo -e "${BLUE}Loading environment from ../.env.local...${NC}"
        set -a
        source ../.env.local
        set +a
    else
        echo -e "${RED}Error: .env.local file not found in project root!${NC}"
        echo "Please ensure .env.local exists in the project root with CCP contract addresses"
        echo "Run from project root: cp cc-protocol/env.foundry.template .env.local"
        exit 1
    fi
}

# Verify required environment variables for crypto flow
verify_crypto_environment() {
    echo -e "\n${BLUE}=== Crypto Flow Environment Verification ===${NC}"
    
    # Setup Foundry first
    setup_foundry
    
    local required_vars=(
        "NEXT_PUBLIC_RPC_URL"
        "NEXT_PUBLIC_TREASURY_FACTORY"
        "NEXT_PUBLIC_GLOBAL_PARAMS"
        "NEXT_PUBLIC_PLATFORM_HASH"
        "NEXT_PUBLIC_USDC_ADDRESS"
        "NEXT_PUBLIC_PLATFORM_ADMIN"
        "DATABASE_URL"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}✗ Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo -e "\n${YELLOW}To fix this:${NC}"
        echo "1. Copy CCP contract addresses from cc-protocol/env.foundry.template"
        echo "2. Update .env.local with actual contract addresses from CCP team"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All crypto flow environment variables present${NC}"
}

# Check database connectivity
verify_database_connection() {
    echo -e "\n${BLUE}=== Database Connection Verification ===${NC}"
    
    # Test database connection using a simple Prisma command (from project root)
    if (cd .. && docker compose exec -T app pnpm prisma db pull --force >/dev/null 2>&1); then
        echo -e "${GREEN}✓ Database connection successful${NC}"
    else
        # Try a simpler test - just check if app container is running
        if (cd .. && docker compose exec -T app echo "test" >/dev/null 2>&1); then
            echo -e "${YELLOW}⚠ App container running but database connection unclear${NC}"
            echo -e "${BLUE}Proceeding with crypto flow testing...${NC}"
        else
            echo -e "${RED}✗ Database connection failed${NC}"
            echo "Please ensure Docker containers are running from project root:"
            echo "  cd .. && docker compose up -d"
            exit 1
        fi
    fi
}

# Check admin wallet setup and balances
check_admin_setup() {
    echo -e "\n${BLUE}=== Admin Wallet Setup Verification ===${NC}"
    
    # Setup Foundry first
    setup_foundry
    
    echo "Platform Admin Address: $NEXT_PUBLIC_PLATFORM_ADMIN"
    
    # Check CELO balance for gas
    echo -e "\n${YELLOW}Checking CELO balance...${NC}"
    local celo_balance=$(cast balance $NEXT_PUBLIC_PLATFORM_ADMIN --rpc-url $NEXT_PUBLIC_RPC_URL 2>/dev/null || echo "0")
    if [ "$celo_balance" = "0" ]; then
        echo -e "${RED}✗ Failed to fetch CELO balance${NC}"
        echo "CELO Balance: Unknown"
        local celo_hr="0"
    else
        local celo_hr=$(cast to-unit $celo_balance ether 2>/dev/null || echo "0")
        echo "CELO Balance: $celo_hr CELO"
    fi
    
    # Check USDC balance
    echo -e "\n${YELLOW}Checking USDC balance...${NC}"
    local usdc_balance_raw=$(cast call $NEXT_PUBLIC_USDC_ADDRESS "balanceOf(address)(uint256)" $NEXT_PUBLIC_PLATFORM_ADMIN --rpc-url $NEXT_PUBLIC_RPC_URL 2>/dev/null || echo "0")
    local usdc_balance=$(echo "$usdc_balance_raw" | sed 's/\[.*\]//' | xargs)
    
    if [[ "$usdc_balance" == 0x* ]]; then
        usdc_balance=$(cast to-dec $usdc_balance 2>/dev/null || echo "0")
    fi
    
    # Ensure usdc_balance is numeric
    if [[ ! "$usdc_balance" =~ ^[0-9]+$ ]]; then
        usdc_balance="0"
    fi
    
    local usdc_hr=$(echo "scale=6; $usdc_balance / 1000000" | bc -l 2>/dev/null || echo "0")
    echo "USDC Balance: $usdc_hr USDC"
    
    # Minimum balance checks
    echo -e "\n${YELLOW}Balance Assessment:${NC}"
    if command -v bc >/dev/null 2>&1 && [[ "$celo_hr" =~ ^[0-9]+\.?[0-9]*$ ]]; then
        if [ $(echo "$celo_hr < 0.01" | bc -l 2>/dev/null || echo "1") -eq 1 ]; then
            echo -e "${YELLOW}⚠ Low CELO balance for gas fees${NC}"
        else
            echo -e "${GREEN}✓ Sufficient CELO for gas${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Could not verify CELO balance${NC}"
    fi
    
    if [[ -n "$usdc_balance" ]] && [[ "$usdc_balance" =~ ^[0-9]+$ ]] && [ "$usdc_balance" -lt "1000000" ]; then
        echo -e "${YELLOW}⚠ Low USDC balance for testing${NC}"
    else
        echo -e "${GREEN}✓ Sufficient USDC for testing${NC}"
    fi
}

# Create test campaign via API
create_test_campaign() {
    echo -e "\n${BLUE}=== Creating Test Campaign ===${NC}"
    
    local timestamp=$(date +%s)
    local campaign_title="Debug Campaign $timestamp"
    local campaign_slug="debug-campaign-$timestamp"
    
    echo "Creating campaign: $campaign_title"
    
    # Campaign data (using macOS compatible date commands)
    local start_time=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    local end_time=$(date -u -v+30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    
    local campaign_data=$(cat <<EOF
{
  "title": "$campaign_title",
  "description": "Debug campaign for crypto flow testing - created $(date)",
  "fundingGoal": "1000",
  "startTime": "$start_time",
  "endTime": "$end_time",
  "location": "Test Location",
  "category": "Technology",
  "slug": "$campaign_slug"
}
EOF
    )
    
    # Create campaign via API (requires authentication)
    echo -e "${YELLOW}Note: Campaign creation requires authentication${NC}"
    echo "Campaign data prepared:"
    if command -v jq >/dev/null 2>&1; then
        echo "$campaign_data" | jq .
    else
        echo "$campaign_data"
    fi
    
    echo -e "\n${YELLOW}Manual Step Required:${NC}"
    echo "1. Go to http://localhost:3000/campaigns/create"
    echo "2. Fill in the form with the following details:"
    echo "   - Title: $campaign_title"
    echo "   - Description: Debug campaign for crypto flow testing"
    echo "   - Funding Goal: 1000 USDC"
    echo "   - Category: Technology"
    echo "   - Location: Test Location"
    echo "3. Submit the campaign"
    echo "4. Note down the campaign ID and slug from the URL"
    
    read -p "Enter the created campaign ID: " CAMPAIGN_ID
    read -p "Enter the created campaign slug: " CAMPAIGN_SLUG
    
    if [ -z "$CAMPAIGN_ID" ] || [ -z "$CAMPAIGN_SLUG" ]; then
        echo -e "${RED}✗ Campaign ID and slug are required${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Test campaign created: ID=$CAMPAIGN_ID, Slug=$CAMPAIGN_SLUG${NC}"
    
    # Export for use in other functions
    export TEST_CAMPAIGN_ID="$CAMPAIGN_ID"
    export TEST_CAMPAIGN_SLUG="$CAMPAIGN_SLUG"
}

# Get campaign details from database
get_campaign_details() {
    echo -e "\n${BLUE}=== Retrieving Campaign Details ===${NC}"
    
    if [ -z "$TEST_CAMPAIGN_ID" ]; then
        echo -e "${RED}✗ No campaign ID available${NC}"
        return 1
    fi
    
    # Query campaign from database using Docker PostgreSQL
    local campaign_query="SELECT id, title, status, \"campaignAddress\", \"treasuryAddress\", \"cryptoTreasuryAddress\", \"treasuryMode\" FROM \"Campaign\" WHERE id = $TEST_CAMPAIGN_ID;"
    
    echo "Querying campaign details..."
    local campaign_result=$(docker compose exec -T database psql -U akashic -d akashic_dev -c "$campaign_query" 2>/dev/null || echo "")
    
    if [ -n "$campaign_result" ]; then
        echo "Campaign Details:"
        echo "$campaign_result"
        
        # Extract campaign address if available
        local campaign_address=$(echo "$campaign_result" | grep -o '0x[a-fA-F0-9]\{40\}' | head -1 || echo "")
        if [ -n "$campaign_address" ]; then
            export TEST_CAMPAIGN_ADDRESS="$campaign_address"
            echo -e "${GREEN}✓ Campaign address found: $campaign_address${NC}"
        else
            echo -e "${YELLOW}⚠ No campaign address found (not deployed yet)${NC}"
        fi
    else
        echo -e "${RED}✗ Could not retrieve campaign details${NC}"
    fi
}

# Admin approval workflow
admin_approve_campaign() {
    echo -e "\n${BLUE}=== Admin Approval Workflow ===${NC}"
    
    if [ -z "$TEST_CAMPAIGN_ID" ]; then
        echo -e "${RED}✗ No campaign ID available${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Admin Approval Steps:${NC}"
    echo "1. Open admin dashboard: http://localhost:3000/admin"
    echo "2. Find campaign ID: $TEST_CAMPAIGN_ID"
    echo "3. Click 'Approve Campaign' button"
    echo "4. Wait for treasury deployment to complete"
    echo "5. Verify treasury address is displayed"
    
    echo -e "\n${YELLOW}Required Admin Authentication:${NC}"
    echo "Use wallet address: $NEXT_PUBLIC_PLATFORM_ADMIN"
    echo "This address is configured as the platform admin"
    
    read -p "Press Enter after approving the campaign..."
    
    # Re-check campaign details after approval
    get_campaign_details
    
    if [ -n "$TEST_CAMPAIGN_ADDRESS" ]; then
        echo -e "${GREEN}✓ Campaign approved with treasury deployment${NC}"
    else
        echo -e "${RED}✗ Campaign approval may have failed${NC}"
        return 1
    fi
}

# Check treasury balance for specific campaign
check_campaign_treasury_balance() {
    echo -e "\n${BLUE}=== Campaign Treasury Balance Check ===${NC}"
    
    if [ -z "$TEST_CAMPAIGN_ADDRESS" ]; then
        echo -e "${RED}✗ No treasury address available${NC}"
        return 1
    fi
    
    echo "Treasury Address: $TEST_CAMPAIGN_ADDRESS"
    
    # Check treasury balance using contract calls
    echo -e "\n${YELLOW}Querying treasury contract...${NC}"
    
    # Get raised amount
    local raised_amount_raw=$(cast call $TEST_CAMPAIGN_ADDRESS "getRaisedAmount()" --rpc-url $NEXT_PUBLIC_RPC_URL 2>/dev/null || echo "0")
    local raised_amount=$(cast to-dec $raised_amount_raw 2>/dev/null || echo "0")
    local raised_hr=$(echo "scale=6; $raised_amount / 1000000" | bc -l 2>/dev/null || echo "0")
    
    # Get available amount
    local available_amount_raw=$(cast call $TEST_CAMPAIGN_ADDRESS "getAvailableRaisedAmount()" --rpc-url $NEXT_PUBLIC_RPC_URL 2>/dev/null || echo "0")
    local available_amount=$(cast to-dec $available_amount_raw 2>/dev/null || echo "0")
    local available_hr=$(echo "scale=6; $available_amount / 1000000" | bc -l 2>/dev/null || echo "0")
    
    # Get goal amount
    local goal_amount_raw=$(cast call $TEST_CAMPAIGN_ADDRESS "getGoalAmount()" --rpc-url $NEXT_PUBLIC_RPC_URL 2>/dev/null || echo "0")
    local goal_amount=$(cast to-dec $goal_amount_raw 2>/dev/null || echo "0")
    local goal_hr=$(echo "scale=6; $goal_amount / 1000000" | bc -l 2>/dev/null || echo "0")
    
    echo "Treasury Balance Information:"
    echo "  Raised Amount: $raised_hr USDC (raw: $raised_amount)"
    echo "  Available Amount: $available_hr USDC (raw: $available_amount)"
    echo "  Goal Amount: $goal_hr USDC (raw: $goal_amount)"
    
    # Check database payment records
    echo -e "\n${YELLOW}Checking database payment records...${NC}"
    local payments_query="SELECT COUNT(*), SUM(CAST(amount AS NUMERIC)) FROM \"Payment\" WHERE \"campaignId\" = $TEST_CAMPAIGN_ID AND status = 'confirmed';"
    local payments_result=$(docker compose exec -T database psql -U akashic -d akashic_dev -c "$payments_query" 2>/dev/null || echo "")
    
    if [ -n "$payments_result" ]; then
        echo "Database Payment Records:"
        echo "$payments_result"
    fi
    
    # Export balance for verification
    export TREASURY_RAISED_AMOUNT="$raised_amount"
    export TREASURY_AVAILABLE_AMOUNT="$available_amount"
    
    echo -e "${GREEN}✓ Treasury balance check completed${NC}"
}

# Test contribution workflow
test_contribution_workflow() {
    echo -e "\n${BLUE}=== Contribution Workflow Test ===${NC}"
    
    if [ -z "$TEST_CAMPAIGN_SLUG" ]; then
        echo -e "${RED}✗ No campaign slug available${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Contribution Testing Steps:${NC}"
    echo "1. Open campaign page: http://localhost:3000/campaigns/$TEST_CAMPAIGN_SLUG"
    echo "2. Click 'Donate' or 'Contribute' button"
    echo "3. Select 'Crypto Wallet' payment method"
    echo "4. Enter test amount (e.g., 5 USDC)"
    echo "5. Connect wallet and approve USDC spending"
    echo "6. Complete the pledge transaction"
    echo "7. Wait for transaction confirmation"
    
    echo -e "\n${YELLOW}For testing, you can use any wallet with USDC balance${NC}"
    echo "Testnet USDC faucet: https://faucet.celo.org/"
    
    read -p "Press Enter after completing a test contribution..."
    
    # Recheck treasury balance after contribution
    check_campaign_treasury_balance
    
    if [ "$TREASURY_RAISED_AMOUNT" -gt "0" ]; then
        echo -e "${GREEN}✓ Contribution detected in treasury${NC}"
    else
        echo -e "${YELLOW}⚠ No contributions detected yet${NC}"
    fi
}

# Verify database consistency
verify_database_consistency() {
    echo -e "\n${BLUE}=== Database Consistency Verification ===${NC}"
    
    if [ -z "$TEST_CAMPAIGN_ID" ] || [ -z "$TREASURY_RAISED_AMOUNT" ]; then
        echo -e "${YELLOW}⚠ Insufficient data for consistency check${NC}"
        return 0
    fi
    
    # Get total payments from database
    local db_total_query="SELECT COALESCE(SUM(CAST(amount AS NUMERIC)), 0) FROM \"Payment\" WHERE \"campaignId\" = $TEST_CAMPAIGN_ID AND status = 'confirmed';"
    local db_total_result=$(docker compose exec -T database psql -U akashic -d akashic_dev -c "$db_total_query" 2>/dev/null || echo "0")
    local db_total=$(echo "$db_total_result" | grep -o '[0-9]\+' | head -1 || echo "0")
    
    # Convert treasury amount to same units (USDC with 6 decimals)
    local treasury_total_usdc=$(echo "scale=6; $TREASURY_RAISED_AMOUNT / 1000000" | bc -l 2>/dev/null || echo "0")
    
    echo "Consistency Check:"
    echo "  Database Total: $db_total USDC"
    echo "  Treasury Total: $treasury_total_usdc USDC"
    
    # Compare values (allowing for small differences due to precision)
    local difference=$(echo "scale=6; $treasury_total_usdc - $db_total" | bc -l 2>/dev/null || echo "0")
    local abs_diff=$(echo "$difference" | sed 's/-//')
    
    if [ $(echo "$abs_diff < 0.01" | bc -l) -eq 1 ]; then
        echo -e "${GREEN}✓ Database and treasury are consistent${NC}"
    else
        echo -e "${YELLOW}⚠ Difference detected: $difference USDC${NC}"
        echo "This may be due to pending transactions or timing"
    fi
}

# Generate debugging report
generate_debug_report() {
    echo -e "\n${BOLD}${BLUE}=== Crypto Flow Debug Report ===${NC}"
    
    local timestamp=$(date)
    echo "Generated: $timestamp"
    echo ""
    
    echo "Environment Configuration:"
    echo "  RPC URL: $NEXT_PUBLIC_RPC_URL"
    echo "  Treasury Factory: $NEXT_PUBLIC_TREASURY_FACTORY"
    echo "  USDC Address: $NEXT_PUBLIC_USDC_ADDRESS"
    echo "  Platform Admin: $NEXT_PUBLIC_PLATFORM_ADMIN"
    echo ""
    
    if [ -n "$TEST_CAMPAIGN_ID" ]; then
        echo "Test Campaign:"
        echo "  ID: $TEST_CAMPAIGN_ID"
        echo "  Slug: $TEST_CAMPAIGN_SLUG"
        echo "  Treasury Address: ${TEST_CAMPAIGN_ADDRESS:-'Not deployed'}"
        echo ""
    fi
    
    if [ -n "$TREASURY_RAISED_AMOUNT" ]; then
        local raised_hr=$(echo "scale=6; $TREASURY_RAISED_AMOUNT / 1000000" | bc -l 2>/dev/null || echo "0")
        echo "Treasury Status:"
        echo "  Raised Amount: $raised_hr USDC"
        echo "  Raw Amount: $TREASURY_RAISED_AMOUNT wei"
        echo ""
    fi
    
    echo "Next Steps:"
    echo "1. Verify campaign creation works correctly"
    echo "2. Test admin approval with treasury deployment"
    echo "3. Complete contribution workflow"
    echo "4. Monitor balance consistency between DB and treasury"
    echo ""
    
    echo -e "${GREEN}Debug report completed${NC}"
}

# Main execution function
main() {
    echo -e "${BOLD}${GREEN}🧪 Akashic Crypto Flow Debugging Tool${NC}"
    echo "============================================="
    echo "This script helps debug the complete crypto-only payment flow"
    echo "from campaign creation to balance verification."
    echo ""
    
    load_environment
    verify_crypto_environment
    verify_database_connection
    check_admin_setup
    
    echo -e "\n${BOLD}Starting crypto flow debugging workflow...${NC}"
    
    # Interactive workflow
    echo -e "\n${YELLOW}Choose debugging workflow:${NC}"
    echo "1. Full workflow (create → approve → contribute → verify)"
    echo "2. Check existing campaign balance"
    echo "3. Admin setup verification only"
    echo "4. Environment check only"
    
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            create_test_campaign
            get_campaign_details
            admin_approve_campaign
            test_contribution_workflow
            verify_database_consistency
            generate_debug_report
            ;;
        2)
            read -p "Enter campaign ID to check: " TEST_CAMPAIGN_ID
            if [ -n "$TEST_CAMPAIGN_ID" ]; then
                export TEST_CAMPAIGN_ID
                get_campaign_details
                if [ -n "$TEST_CAMPAIGN_ADDRESS" ]; then
                    check_campaign_treasury_balance
                    verify_database_consistency
                fi
            fi
            ;;
        3)
            echo -e "${GREEN}✓ Admin setup verification completed${NC}"
            ;;
        4)
            echo -e "${GREEN}✓ Environment check completed${NC}"
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo -e "\n${BOLD}${GREEN}🎉 Crypto Flow Debugging Completed!${NC}"
}

# Allow running specific functions
case "${1:-}" in
    "env"|"environment")
        load_environment
        verify_crypto_environment
        ;;
    "admin"|"admin-setup")
        load_environment
        check_admin_setup
        ;;
    "balance"|"check-balance")
        if [ -n "$2" ]; then
            export TEST_CAMPAIGN_ID="$2"
            load_environment
            get_campaign_details
            check_campaign_treasury_balance
        else
            echo "Usage: $0 balance <campaign_id>"
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  env          - Verify environment variables only"
        echo "  admin        - Check admin wallet setup"
        echo "  balance <id> - Check treasury balance for specific campaign"
        echo "  help         - Show this help message"
        echo ""
        echo "Default: Run interactive debugging workflow"
        ;;
    *)
        main
        ;;
esac
