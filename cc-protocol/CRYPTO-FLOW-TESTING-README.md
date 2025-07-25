# Crypto Flow Testing Guide for Akashic MVP

## 🎯 **Overview**

This guide provides a complete, step-by-step workflow for testing the Akashic crypto-only payment flow with CC Protocol integration. Everything you need to validate the complete workflow from campaign creation to balance verification.

## 📋 **Prerequisites**

- ✅ Docker and Docker Compose installed
- ✅ Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- ✅ CCP contract addresses from the team
- ✅ Admin private keys for testing

### **Foundry Installation**

If you get "cast: command not found" errors:

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Add to shell profile and reload
source ~/.bashrc && foundryup

# Or manually add to PATH
export PATH="$HOME/.foundry/bin:$PATH"
```

**Note**: The debug scripts will automatically add Foundry to PATH if installed in the default location.

## 🚀 **Quick Start (5 Minutes)**

### **Step 1: Environment Setup**

**CRITICAL**: The `.env.local` file must be in the **project root**, not in `cc-protocol/`.

```bash
# From project root (/path/to/akashic)
cp cc-protocol/env.foundry.template .env.local

# Edit .env.local with actual CCP contract addresses
# Replace all 0x0000... placeholders with real values from CCP team
```

### **Step 2: Start Application**

```bash
# Start Docker containers
docker compose up -d

# Verify application is running
curl http://localhost:3000/api/campaigns
```

### **Step 3: Verify Setup**

```bash
# Test environment loading
./cc-protocol/crypto-flow-debug.sh env

# Should show: "Loading environment from ../.env.local..."
# Check admin wallet balances
./cc-protocol/crypto-flow-debug.sh admin
```

### **Step 4: Run Complete Test**

```bash
# Interactive debugging workflow
./cc-protocol/crypto-flow-debug.sh

# Choose option 1 for full workflow testing
```

## 🔧 **Environment Configuration**

### **Required Variables in .env.local**

```bash
# Platform Admin Configuration
NEXT_PUBLIC_PLATFORM_ADMIN=0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70
PLATFORM_ADMIN_PRIVATE_KEY=0x[full_private_key_from_ccp_team]

# Contract Addresses (from CCP team)
NEXT_PUBLIC_TREASURY_FACTORY=0x355238dfFC33E3637C5643230831459Aa4f48FaD
NEXT_PUBLIC_GLOBAL_PARAMS=0x4A3178cc4F27362ef2500989D7319a4a8064B939
NEXT_PUBLIC_PLATFORM_HASH=0x8dfe5499a94ebda35ae3d6c7b6c32b140c2cb04687d76f2cc3564ada0ef5dce6
NEXT_PUBLIC_USDC_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://alfajores-forno.celo-testnet.org
DATABASE_URL=postgres://akashic:akashic@db:5432/akashic_dev
```

### **Verification Commands**

```bash
# Check admin wallet balance
cast balance 0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70 --rpc-url https://alfajores-forno.celo-testnet.org

# Check USDC balance
cast call 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 "balanceOf(address)(uint256)" 0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70 --rpc-url https://alfajores-forno.celo-testnet.org

# Test treasury factory connection
cast call 0x355238dfFC33E3637C5643230831459Aa4f48FaD "getImplementation(bytes32,uint256)" 0x8dfe5499a94ebda35ae3d6c7b6c32b140c2cb04687d76f2cc3564ada0ef5dce6 0 --rpc-url https://alfajores-forno.celo-testnet.org
```

## 🔐 **Admin Authentication Setup**

### **MetaMask Setup for Admin Testing**

The application uses **Silk for authentication** (SIWE), but **MetaMask as the browser wallet**.

#### **Step 1: MetaMask Configuration**

1. **Open a new browser window/profile** (to avoid conflicts)
2. **Install MetaMask** if not already installed
3. **Import the platform admin wallet**:
   - Click "Import Account" → "Private Key"
   - Use: `PLATFORM_ADMIN_PRIVATE_KEY` from `.env.local`
   - Set account name: "Akashic Admin (Testnet)"

#### **Step 2: Network Setup**

1. **Add Celo Alfajores Testnet** to MetaMask:
   - Network Name: `Celo Alfajores Testnet`
   - RPC URL: `https://alfajores-forno.celo-testnet.org`
   - Chain ID: `44787`
   - Currency Symbol: `CELO`
   - Block Explorer: `https://alfajores-blockscout.celo-testnet.org/`

2. **Add USDC Token** to MetaMask:
   - Go to "Import tokens" → "Custom token"
   - Token Address: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
   - Token Symbol: `USDC`
   - Token Decimals: `6`

#### **Step 3: Authentication Process**

1. **Navigate to**: `http://localhost:3000`
2. **Connect wallet**: Select MetaMask → Approve connection
3. **Sign SIWE message**: Authenticate with Silk (happens automatically)
4. **Verify admin access**: Go to `http://localhost:3000/admin`

**Expected Result**: Admin dashboard with campaign approval interface

## 🧪 **Complete Testing Workflow**

### **Phase 1: Environment Validation**

```bash
# 1. Check environment setup
./cc-protocol/crypto-flow-debug.sh env

# 2. Verify admin wallet
./cc-protocol/crypto-flow-debug.sh admin

# 3. Test contract connectivity
./cc-protocol/cc-protocol-test.sh connect
```

**Expected Output**:
- ✅ All environment variables present
- ✅ Database connection successful
- ✅ Admin wallet has CELO and USDC
- ✅ Contract connectivity confirmed

### **Phase 2: Campaign Creation & Approval**

#### **2.1 Create Test Campaign**

1. **Go to**: `http://localhost:3000/campaigns/create`
2. **Fill form with**:
   - Title: "Debug Campaign [timestamp]"
   - Description: "Crypto flow testing campaign"
   - Funding Goal: 1000 USDC
   - Category: Technology
   - Location: Test Location
3. **Submit campaign** and note the Campaign ID

#### **2.2 Admin Approval**

1. **Open admin session** (MetaMask with admin private key)
2. **Go to**: `http://localhost:3000/admin`
3. **Find your test campaign**
4. **Click "Approve Campaign"**
5. **Approve transaction in MetaMask**
6. **Wait for treasury deployment**

**Expected Result**: Campaign status changes to ACTIVE with treasury address

### **Phase 3: Contribution Testing**

#### **3.1 Make Test Contribution**

1. **Open campaign page**: `http://localhost:3000/campaigns/[slug]`
2. **Click "Donate" button**
3. **Select "Crypto Wallet" payment method**
4. **Enter amount**: 5 USDC
5. **Connect wallet and approve USDC spending**
6. **Complete pledge transaction**
7. **Wait for confirmation**

#### **3.2 Verify Payment**

```bash
# Check campaign treasury balance vs database
./cc-protocol/crypto-flow-debug.sh balance <campaign_id>

# Or use enhanced checking
./cc-protocol/cc-protocol-test.sh campaign-balance <campaign_id>
```

**Expected Result**: Treasury balance matches database payment records

### **Phase 4: Balance Verification**

```bash
# Detailed consistency check
./cc-protocol/cc-protocol-test.sh campaign-balance <campaign_id>
```

**Expected Output**:
- ✅ Treasury contract balance
- ✅ Database payment records
- ✅ Consistency verification
- ✅ Campaign progress calculation

## 🛠️ **Available Testing Tools**

### **1. Interactive Debug Script**

```bash
# Complete interactive workflow
./cc-protocol/crypto-flow-debug.sh

# Options:
# 1. Full workflow (create → approve → contribute → verify)
# 2. Check existing campaign balance
# 3. Admin setup verification only
# 4. Environment check only
```

### **2. Specific Command Tests**

```bash
# Environment verification
./cc-protocol/crypto-flow-debug.sh env

# Admin wallet verification
./cc-protocol/crypto-flow-debug.sh admin

# Campaign balance check
./cc-protocol/crypto-flow-debug.sh balance <campaign_id>
```

### **3. Enhanced Protocol Tests**

```bash
# Complete contract workflow
./cc-protocol/cc-protocol-test.sh workflow

# Campaign-specific balance verification
./cc-protocol/cc-protocol-test.sh campaign-balance <campaign_id>

# Environment and connectivity
./cc-protocol/cc-protocol-test.sh env
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Environment File Not Found**

**Error**: `.env.local file not found`

**Solution**:
```bash
# Ensure .env.local is in project root, not cc-protocol/
# Wrong: cc-protocol/.env.local
# Correct: .env.local (in project root)

cp cc-protocol/env.foundry.template .env.local
```

#### **2. Database Connection Failed**

**Error**: `Database connection failed`

**Solution**:
```bash
# Start Docker containers
docker compose up -d

# Verify database is running
docker compose ps
```

#### **3. Admin Authentication Failed**

**Error**: `Not authorized as admin`

**Solution**:
- Verify wallet address matches `NEXT_PUBLIC_PLATFORM_ADMIN`
- Ensure MetaMask is connected with correct account
- Check private key is correctly imported

#### **4. Treasury Deployment Failed**

**Error**: Treasury deployment transaction fails

**Solution**:
```bash
# Check contract connectivity
./cc-protocol/cc-protocol-test.sh connect

# Verify admin wallet has CELO for gas
./cc-protocol/crypto-flow-debug.sh admin

# Check campaign has valid campaignAddress
```

#### **5. Balance Inconsistency**

**Error**: Database vs treasury balance mismatch

**Solution**:
```bash
# Wait for blockchain confirmation
# Check for pending transactions
./cc-protocol/cc-protocol-test.sh campaign-balance <campaign_id>
```

#### **6. Low Wallet Balances**

**Error**: Insufficient CELO or USDC

**Solution**:
- **CELO**: Visit https://faucet.celo.org/
- **USDC**: Use Celo Alfajores faucet
- Add admin wallet address and request tokens

#### **7. Cast Command Not Found**

**Error**: `cast: command not found`

**Solution**:
```bash
# Install Foundry if not installed
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc && foundryup

# Or manually add to current session
export PATH="$HOME/.foundry/bin:$PATH"

# Verify installation
cast --version
```

### **Debug Commands**

```bash
# Quick environment check
./cc-protocol/crypto-flow-debug.sh env

# Full admin verification
./cc-protocol/crypto-flow-debug.sh admin

# Campaign balance verification
./cc-protocol/cc-protocol-test.sh campaign-balance <id>

# Complete workflow test
./cc-protocol/cc-protocol-test.sh workflow
```

## 📁 **File Structure Reference**

```
akashic/                                    # Project root
├── .env.local                              # ✅ Environment file here
├── cc-protocol/
│   ├── crypto-flow-debug.sh                # Interactive debugging tool
│   ├── cc-protocol-test.sh                 # Enhanced testing script
│   ├── env.foundry.template                # Template to copy
│   ├── CRYPTO-FLOW-TESTING-README.md       # This file
│   └── [other documentation files]
├── docker-compose.yml
└── [application files]
```

## 🎯 **Success Criteria**

Your crypto flow is working correctly when:

- ✅ **Environment**: All variables loaded, contracts accessible
- ✅ **Admin Setup**: Wallet funded, authentication working
- ✅ **Campaign Creation**: Can create campaigns via web interface
- ✅ **Admin Approval**: Can approve campaigns, treasury deploys
- ✅ **Crypto Payments**: Can make USDC payments via MetaMask
- ✅ **Balance Consistency**: Treasury and database match
- ✅ **End-to-End**: Complete workflow from creation to payment works

## 🔄 **Validation Patterns**

### **Treasury Contract Functions**

```bash
# KeepWhatsRaised (Crypto-Only Flow)
pledgeWithoutAReward(address backer, uint256 pledgeAmount, uint256 tip)
getRaisedAmount() → uint256
getAvailableRaisedAmount() → uint256
getDeadline() → uint256
getGoalAmount() → uint256
```

### **Payment Flow Architecture**

```
User Creates Campaign → Deploy CampaignInfo Contract
     ↓
Admin Approves → Deploy KeepWhatsRaised Treasury
     ↓
User Makes Payment → USDC Approval + Pledge Transaction
     ↓
System Updates → Database Payment Record + Treasury Balance
     ↓
Verification → Balance Consistency Check
```

## 🔒 **Security Notes**

⚠️ **IMPORTANT REMINDERS**:

- 🔒 **Testnet Only**: All keys and addresses are for Celo Alfajores testnet
- 🔒 **No Real Value**: Testnet tokens have no monetary value
- 🔒 **Development Use**: Never use these keys in production
- 🔒 **Separate Browser**: Use separate browser profile for admin testing
- 🔒 **Local Only**: Keep private keys in `.env.local` (not committed)

## 📞 **Support**

If you encounter issues:

1. **Check Environment**: Run `./cc-protocol/crypto-flow-debug.sh env`
2. **Verify Setup**: Run `./cc-protocol/crypto-flow-debug.sh admin`
3. **Test Connectivity**: Run `./cc-protocol/cc-protocol-test.sh connect`
4. **Check Logs**: `docker compose logs app`
5. **Report Issues**: Document error messages and reproduction steps

## 🚀 **Next Steps**

After successful crypto flow validation:

1. **Document Results**: Record any issues or successful test results
2. **Test Edge Cases**: Different campaign states and payment amounts
3. **Prepare Integration**: Use findings to update application code
4. **Campaign Editing**: Proceed to Phase A2 implementation
5. **Withdrawal System**: Implement creator fund withdrawal

---

**🎉 Ready to test the complete crypto-only payment flow!** 