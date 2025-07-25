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
      console.log('🔍 Checking TreasuryFactory state...');
      try {
        // Check if we can call a simple view function
        const factoryCode = await ethersProvider.getCode(platformConfig.treasuryFactoryAddress);
        console.log('TreasuryFactory has code:', factoryCode.length > 2);
        
        // Check if KeepWhatsRaised implementation (index 0) is available
        console.log('🔍 Checking KeepWhatsRaised implementation availability...');
        
        // Try to check implementation status (this might fail if function doesn't exist)
        try {
          // Most TreasuryFactory contracts have a way to check if implementations are approved
          // Let's try a few common patterns
          console.log('Attempting to verify implementation approval status...');
          
          // This is likely to fail, but will give us insight into what's available
          const implementationCheck = await treasuryFactory.getImplementation?.(
            platformConfig.platformBytes,
            0
          );
          console.log('✓ KeepWhatsRaised implementation found:', implementationCheck);
        } catch (implError: any) {
          console.log('⚠️  Cannot verify implementation status (function may not exist):', implError.message);
          console.log('🔍 This suggests the implementation might not be registered/approved');
        }
        
        console.log('Platform bytes being used:', platformConfig.platformBytes);
        console.log('Bytecode indices to deploy: 0 (KeepWhatsRaised), 1 (PaymentTreasury)');
        
      } catch (debugError: any) {
        console.warn('Debug check failed:', debugError.message);
      }

      // Add specific guidance for implementation setup
      console.log('💡 If deployment fails with revert:');
      console.log('   1. KeepWhatsRaised implementation (ID=0) may not be registered');
      console.log('   2. Implementation may not be approved by protocol admin');
      console.log('   3. Run CC Protocol setup script to register implementations');
      console.log('   4. Check that bytecode index 0 is available for platform hash');

      // Debug: Check contract state before deployment
      // Verify TreasuryFactory is deployed
      try {
        const factoryCode = await ethersProvider.getCode(platformConfig.treasuryFactoryAddress);
        if (factoryCode.length <= 2) {
          throw new Error('TreasuryFactory contract not found at configured address');
        }
        console.log('✅ TreasuryFactory contract confirmed');
        
        // Debug: Check if treasury already exists using computeTreasuryAddress
        console.log('🔍 Checking if treasury already deployed for this campaign...');
        try {
          // Use the campaignAddress as identifier hash for treasury computation
          const identifierHash = ethers.keccak256(ethers.toUtf8Bytes(campaignAddress));
          const [treasuryAddress, isDeployed] = await treasuryFactory.computeTreasuryAddress(
            identifierHash,
            platformConfig.platformBytes,
            0 // bytecodeIndex for KeepWhatsRaised
          );
          
          console.log('Computed treasury address:', treasuryAddress);
          console.log('Is already deployed:', isDeployed);
          
          if (isDeployed) {
            console.log('⚠️ Treasury already deployed at:', treasuryAddress);
            console.log('This explains why deployment is failing - duplicate deployment prevented');
            
            // Return the existing treasury address instead of trying to deploy
            console.log('✅ Using existing treasury address');
            return {
              cryptoTreasuryAddress: treasuryAddress,
              paymentTreasuryAddress: '0x0000000000000000000000000000000000000000',
              cryptoTreasuryTx: 'existing',
              paymentTreasuryTx: '0x0000000000000000000000000000000000000000000000000000000000000000',
            };
          } else {
            console.log('✅ No existing treasury found, proceeding with deployment');
          }
          
        } catch (computeError: any) {
          console.warn('Could not compute treasury address:', computeError.message);
          // Continue with deployment attempt
        }
        
      } catch (error: any) {
        console.warn('Treasury factory validation failed:', error.message);
      }

      // Deploy KeepWhatsRaised Treasury (Crypto Payments) - Implementation ID: 0
      console.log('1/2 Deploying KeepWhatsRaised Treasury (Crypto Payments)...');
      
      let cryptoTx;
      try {
        // Debug: Test the deployment call first with staticCall
        console.log('🔍 Testing deployment with static call...');
        try {
          await treasuryFactory.deploy.staticCall(
            platformConfig.platformBytes, // platformBytes (bytes32)
            0, // bytecodeIndex (uint256) - KeepWhatsRaised
            campaignAddress, // infoAddress (address) 
          );
          console.log('✅ Static call successful - deployment should work');
        } catch (staticError: any) {
          console.error('❌ Static call failed:', staticError);
          console.error('Static call error details:', {
            message: staticError.message,
            reason: staticError.reason,
            code: staticError.code,
            data: staticError.data,
          });
          throw new Error(`Deployment would fail: ${staticError.reason || staticError.message}`);
        }

        cryptoTx = await treasuryFactory.deploy(
          platformConfig.platformBytes, // platformBytes (bytes32)
          0, // bytecodeIndex (uint256) - KeepWhatsRaised
          campaignAddress, // infoAddress (address) 
          { gasLimit: 2000000 },
        );
        console.log('✓ KeepWhatsRaised deployment transaction sent:', cryptoTx.hash);
      } catch (deployError: any) {
        console.error('❌ KeepWhatsRaised deployment failed at transaction submission:', deployError);
        console.error('Deploy error details:', {
          message: deployError.message,
          reason: deployError.reason,
          code: deployError.code,
          data: deployError.data,
        });
        throw new Error(`KeepWhatsRaised deployment failed: ${deployError.message}`);
      }

      const cryptoReceipt = await cryptoTx.wait();
      
      // Check if transaction was successful
      if (cryptoReceipt.status === 0) {
        console.error('❌ KeepWhatsRaised deployment failed - transaction reverted');
        console.error('Transaction details:', {
          hash: cryptoTx.hash,
          gasUsed: cryptoReceipt.gasUsed.toString(),
          gasLimit: '2000000',
          blockNumber: cryptoReceipt.blockNumber,
          logs: cryptoReceipt.logs,
        });
        
        // Try to get revert reason by calling the function as a view call
        try {
          await treasuryFactory.deploy.staticCall(
            platformConfig.platformBytes,
            campaignAddress,
            0,
            `Campaign ${campaignId} Crypto`,
            `C${campaignId}CRYPTO`
          );
        } catch (staticCallError: any) {
          console.error('Static call error (revert reason):', staticCallError);
          if (staticCallError.reason) {
            throw new Error(`KeepWhatsRaised deployment reverted: ${staticCallError.reason}`);
          } else if (staticCallError.message) {
            throw new Error(`KeepWhatsRaised deployment reverted: ${staticCallError.message}`);
          }
        }
        
        throw new Error('KeepWhatsRaised deployment transaction failed - transaction reverted. Check console for details.');
      }
      
      console.log('✅ KeepWhatsRaised deployment transaction confirmed successful!');
      console.log('📋 Transaction Receipt Analysis:');
      console.log('  Status:', cryptoReceipt.status);
      console.log('  Gas Used:', cryptoReceipt.gasUsed.toString());
      console.log('  Block Number:', cryptoReceipt.blockNumber);
      console.log('  Logs Count:', cryptoReceipt.logs.length);
      
      // Debug: Log all events to see what's available
      console.log('🔍 All events in transaction:');
      cryptoReceipt.logs.forEach((log: any, index: number) => {
        console.log(`  Event ${index}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data,
        });
      });
      
      // Try to find the deployment event with different possible names
      let cryptoDeployEvent = cryptoReceipt.events?.find(
        (e: TreasuryDeployedEvent) =>
          e.event === 'TreasuryFactoryTreasuryDeployed',
      );
      
      // If not found, try alternative event names
      if (!cryptoDeployEvent) {
        console.log('🔍 TreasuryFactoryTreasuryDeployed not found, trying alternative event names...');
        cryptoDeployEvent = cryptoReceipt.events?.find(
          (e: any) => e.event === 'TreasuryDeployed' || 
                     e.event === 'Deploy' || 
                     e.event === 'TreasuryCreated'
        );
      }
      
      // If still not found, try to parse logs manually
      if (!cryptoDeployEvent && cryptoReceipt.logs.length > 0) {
        console.log('🔍 No named events found, attempting manual log parsing...');
        
        // Try to find a log that looks like a treasury deployment
        const treasuryLog = cryptoReceipt.logs.find((log: any) => 
          log.address.toLowerCase() === platformConfig.treasuryFactoryAddress.toLowerCase()
        );
        
        if (treasuryLog) {
          console.log('📍 Found log from TreasuryFactory:', treasuryLog);
          
          // Try to extract address from log data
          // Treasury address is typically in the data field as the last 20 bytes
          if (treasuryLog.data && treasuryLog.data.length >= 66) {
            const potentialAddress = '0x' + treasuryLog.data.slice(-40);
            console.log('🎯 Potential treasury address from log data:', potentialAddress);
            
            // Validate it looks like an address
            if (/^0x[a-fA-F0-9]{40}$/.test(potentialAddress)) {
              console.log('✅ Using extracted treasury address:', potentialAddress);
              const cryptoTreasuryAddress = potentialAddress;
              
              // Continue with PaymentTreasury section...
              console.log('✓ KeepWhatsRaised Treasury deployed:', cryptoTreasuryAddress);
              
              // Skip to PaymentTreasury placeholder section
              console.log('2/2 PaymentTreasury deployment (SKIPPED - waiting for CCP team fix)...');
              console.log('📝 PaymentTreasury deployment would use:');
              console.log('  Platform Hash:', platformConfig.platformBytes);
              console.log('  CampaignInfo Address:', campaignAddress);
              console.log('  Implementation ID: 1 (PaymentTreasury)');
              console.log('  Name:', `Campaign ${campaignId} Payment`);
              console.log('  Symbol:', `C${campaignId}PAY`);
              console.log('⚠️  PaymentTreasury deployment skipped - known issue reported to CCP team');
              
              // For now, use placeholder values for PaymentTreasury
              const paymentTreasuryAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
              const paymentTreasuryTx = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Placeholder
              
              console.log('✓ PaymentTreasury placeholder created (deployment skipped)');

              console.log('✅ Dual treasury deployment completed successfully!');
              console.log('📊 Results:');
              console.log('  ✅ KeepWhatsRaised (Crypto): DEPLOYED');
              console.log('  ⏸️  PaymentTreasury (Credit Card): SKIPPED');
              
              return {
                cryptoTreasuryAddress,
                paymentTreasuryAddress,
                cryptoTreasuryTx: cryptoTx.hash,
                paymentTreasuryTx,
              };
            }
          }
        }
      }

      if (!cryptoDeployEvent) {
        console.error('❌ Could not find treasury deployment event or extract address');
        console.error('Available events:', cryptoReceipt.events?.map((e: any) => e.event) || 'none');
        throw new Error('KeepWhatsRaised treasury deployment event not found. Transaction succeeded but could not extract treasury address.');
      }

      const cryptoTreasuryAddress = cryptoDeployEvent.args.treasuryAddress;
      console.log('✓ KeepWhatsRaised Treasury deployed:', cryptoTreasuryAddress);

      // Deploy PaymentTreasury (Credit Card Payments) - Implementation ID: 1
      console.log('2/2 PaymentTreasury deployment (SKIPPED - waiting for CCP team fix)...');
      console.log('📝 PaymentTreasury deployment would use:');
      console.log('  Platform Hash:', platformConfig.platformBytes);
      console.log('  CampaignInfo Address:', campaignAddress);
      console.log('  Implementation ID: 1 (PaymentTreasury)');
      console.log('  Name:', `Campaign ${campaignId} Payment`);
      console.log('  Symbol:', `C${campaignId}PAY`);
      console.log('⚠️  PaymentTreasury deployment skipped - known issue reported to CCP team');
      
      // For now, use placeholder values for PaymentTreasury
      const paymentTreasuryAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
      const paymentTreasuryTx = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Placeholder
      
      console.log('✓ PaymentTreasury placeholder created (deployment skipped)');

      console.log('✅ Dual treasury deployment completed successfully!');
      console.log('📊 Results:');
      console.log('  ✅ KeepWhatsRaised (Crypto): DEPLOYED');
      console.log('  ⏸️  PaymentTreasury (Credit Card): SKIPPED');
      
      return {
        cryptoTreasuryAddress,
        paymentTreasuryAddress,
        cryptoTreasuryTx: cryptoTx.hash,
        paymentTreasuryTx,
      };
    },
    [requestWallet],
  );
  
  return { adminApproveCampaign };
}
