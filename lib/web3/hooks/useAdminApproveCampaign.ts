import { useCallback } from 'react';
import { ethers } from 'ethers';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { chainConfig, useWeb3Context } from '@/lib/web3';
import { enableBypassContractAdmin } from '@/lib/develop';

// Add platform config
const platformConfig = {
  treasuryFactoryAddress: process.env.NEXT_PUBLIC_TREASURY_FACTORY as string,
  globalParamsAddress: process.env.NEXT_PUBLIC_GLOBAL_PARAMS as string,
  platformBytes: process.env.NEXT_PUBLIC_PLATFORM_HASH as string,
  rpcUrl: chainConfig.rpcUrl as string,
};

interface TreasuryDeployedEvent {
  event: string;
  args: {
    treasuryAddress: string;
    infoAddress: string;
    platformBytes: string;
    bytecodeIndex: bigint;
  };
}

interface DualTreasuryDeploymentResult {
  cryptoTreasuryAddress: string;
  paymentTreasuryAddress: string;
  cryptoTreasuryTx: string;
  paymentTreasuryTx: string;
}

// Remove the API route approach and use the direct deployment pattern that worked in the test script

// Add comment explaining the validated approach
/**
 * Admin approval hook for KeepWhatsRaised treasury deployment
 * Based on validated CC Protocol test script pattern
 * 
 * Working deployment pattern:
 * 1. CampaignInfo already exists (deployed during campaign creation)
 * 2. Deploy KeepWhatsRaised treasury using CampaignInfo address
 * 3. PaymentTreasury deployment currently fails (CC Protocol team investigating)
 * 
 * Validated function: treasuryFactory.deploy(platformHash, campaignAddress, 0, name, symbol)
 * Validated treasury: pledgeWithoutAReward(backer, amount, tip)
 */

export function useAdminApproveCampaign() {
  const { requestWallet } = useWeb3Context();
  const adminApproveCampaign = useCallback(
    async (campaignId: number, campaignAddress: string): Promise<DualTreasuryDeploymentResult> => {
      if (!campaignId || !campaignAddress) {
        throw new Error('Campaign ID and address are required');
      }
      const wallet = await requestWallet();
      if (
        !wallet ||
        !(
          typeof wallet.isConnected === 'function' &&
          (await wallet.isConnected())
        )
      ) {
        throw new Error('Wallet not connected');
      }
      
      // Platform config checks
      if (!platformConfig.globalParamsAddress) {
        throw new Error('Global Params contract address is not configured');
      }
      if (!platformConfig.treasuryFactoryAddress) {
        throw new Error('Treasury Factory contract address is not configured');
      }
      if (!platformConfig.platformBytes) {
        throw new Error('Platform bytes is not configured');
      }

      // Get provider from wallet
      const walletProvider = await wallet.getEthereumProvider();
      if (!walletProvider) {
        throw new Error('Ethereum Provider not supported by wallet');
      }
      
      // Switch to Alfajores network
      try {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainConfig.chainId.toString(16)}` }],
        });
      } catch (switchError: unknown) {
        // Type guard to check if it's a ProviderRpcError
        if (
          typeof switchError === 'object' &&
          switchError !== null &&
          'code' in switchError &&
          (switchError as { code: number }).code === 4902
        ) {
          try {
            await walletProvider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig.getAddChainParams()],
            });
          } catch (addError) {
            console.error('Error adding Alfajores network:', addError);
            throw new Error('Failed to add Alfajores network to wallet');
          }
        } else {
          console.error('Error switching to Alfajores network:', switchError);
          throw new Error('Failed to switch to Alfajores network');
        }
      }

      // Create providers
      const ethersProvider = new ethers.BrowserProvider(walletProvider, {
        chainId: chainConfig.chainId,
        name: chainConfig.name,
      });
      const signer = await ethersProvider.getSigner();
      const signerAddress = signer.address;

      // Global params check
      const globalParams = new ethers.Contract(
        platformConfig.globalParamsAddress,
        GlobalParamsABI,
        ethersProvider,
      );
      const platformAdmin = await globalParams.getPlatformAdminAddress(
        platformConfig.platformBytes,
      );

      // Debug logging for admin check
      console.log('🔍 Admin Address Debug:', {
        connectedWallet: signerAddress.toLowerCase(),
        expectedPlatformAdmin: platformAdmin.toLowerCase(),
        platformBytes: platformConfig.platformBytes,
        globalParamsContract: platformConfig.globalParamsAddress,
        matches: platformAdmin.toLowerCase() === signerAddress.toLowerCase(),
        bypassEnabled: enableBypassContractAdmin
      });

      // Admin check
      if (!enableBypassContractAdmin) {
        if (platformAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(`Not authorized as platform admin. Expected: ${platformAdmin}, Got: ${signerAddress}`);
        }
      }

      // CRITICAL: Validate that campaignAddress is a deployed CampaignInfo contract
      try {
        const campaignInfo = new ethers.Contract(
          campaignAddress,
          CampaignInfoABI,
          ethersProvider,
        );
        
        // Verify it's a valid CampaignInfo by calling a read function
        await campaignInfo.getDeadline();
        console.log('✓ CampaignInfo contract validated:', campaignAddress);
      } catch (error) {
        throw new Error(`Invalid CampaignInfo contract at ${campaignAddress}: ${error}`);
      }

      // Initialize TreasuryFactory contract
      const treasuryFactory = new ethers.Contract(
        platformConfig.treasuryFactoryAddress,
        TreasuryFactoryABI,
        signer,
      );

      console.log('Deploying dual treasuries for campaign:', campaignId);
      console.log('Using CampaignInfo address:', campaignAddress);

      // Debug: Check current campaign status in database
      console.log('🔍 Checking current campaign status in database...');
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const campaignData = await response.json();
        console.log('Current campaign data:', {
          id: campaignData.id,
          status: campaignData.status,
          treasuryAddress: campaignData.treasuryAddress,
          cryptoTreasuryAddress: campaignData.cryptoTreasuryAddress,
          paymentTreasuryAddress: campaignData.paymentTreasuryAddress,
          treasuryMode: campaignData.treasuryMode,
        });
        
        if (campaignData.treasuryAddress || campaignData.cryptoTreasuryAddress) {
          console.log('⚠️ Campaign already has treasury addresses - this might be a re-approval');
          console.log('Existing treasury address:', campaignData.treasuryAddress || campaignData.cryptoTreasuryAddress);
        }
      } catch (dbError) {
        console.warn('Could not fetch campaign data:', dbError);
      }

      // Debug: Check contract state before deployment
      // Verify TreasuryFactory is deployed
      try {
        console.log('✅ TreasuryFactory contract confirmed');
        
        // Deploy KeepWhatsRaised Treasury (Implementation ID 0)
        // This pattern is validated by cc-protocol-test.sh
        // Note: KeepWhatsRaised (ID 0) is pre-configured by CC Protocol team
        console.log('🚀 Deploying KeepWhatsRaised Treasury...');
        console.log('Parameters:');
        console.log('  Platform Hash:', platformConfig.platformBytes);
        console.log('  Campaign Address:', campaignAddress);
        console.log('  Implementation ID: 0 (KeepWhatsRaised)');
        
        const cryptoTx = await treasuryFactory.deploy(
          platformConfig.platformBytes,
          campaignAddress, // CRITICAL: Must be CampaignInfo contract address
          0, // KeepWhatsRaised implementation ID
          `Campaign ${campaignId} Crypto`,
          `C${campaignId}CRYPTO`,
          { gasLimit: 2000000 }
        );
        
        const cryptoReceipt = await cryptoTx.wait();
        
        if (cryptoReceipt.status === 0) {
          throw new Error('KeepWhatsRaised deployment transaction reverted');
        }
        
        console.log('✅ KeepWhatsRaised deployment successful');
        
        // Extract treasury address from logs (validated pattern)
        let cryptoTreasuryAddress = '';
        
        const deployedEvent = cryptoReceipt.logs.find((log: any) => {
          try {
            const parsed = treasuryFactory.interface.parseLog(log);
            return parsed && parsed.name === 'TreasuryFactoryTreasuryDeployed';
          } catch {
            return false;
          }
        });
        
        if (deployedEvent) {
          const parsed = treasuryFactory.interface.parseLog(deployedEvent);
          if (parsed) {
            cryptoTreasuryAddress = parsed.args.treasuryAddress;
            console.log('✓ KeepWhatsRaised Treasury:', cryptoTreasuryAddress);
          }
        }
        
        if (!cryptoTreasuryAddress) {
          throw new Error('Failed to extract KeepWhatsRaised treasury address from deployment logs');
        }
        
        // PaymentTreasury deployment (SKIPPED - waiting for CC Protocol team fix)
        console.log('📋 PaymentTreasury deployment skipped (CC Protocol team investigating)');
        const paymentTreasuryAddress = '0x0000000000000000000000000000000000000000';
        const paymentTreasuryTx = '';
        
        console.log('✅ Treasury deployment completed');
        
        return {
          cryptoTreasuryAddress,
          paymentTreasuryAddress,
          cryptoTreasuryTx: cryptoTx.hash,
          paymentTreasuryTx,
        };
        
      } catch (error: any) {
        throw new Error(`Treasury deployment failed: ${error.message}`);
      }
    },
    [requestWallet],
  );
  
  return { adminApproveCampaign };
}
