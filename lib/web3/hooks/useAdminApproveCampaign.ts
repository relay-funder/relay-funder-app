import { useCallback } from 'react';
import { ethers } from 'ethers';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { CampaignInfoABI } from '@/contracts/abi/CampaignInfo';
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

      // Admin check
      if (!enableBypassContractAdmin) {
        if (platformAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error('Not authorized as platform admin');
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

      // Deploy KeepWhatsRaised Treasury (Crypto Payments) - Implementation ID: 0
      console.log('1/2 Deploying KeepWhatsRaised Treasury (Crypto Payments)...');
      const cryptoTx = await treasuryFactory.deploy(
        platformConfig.platformBytes, // platformHash
        campaignAddress, // infoAddress (CampaignInfo contract)
        0, // implementationId (0 = KeepWhatsRaised)
        `Campaign ${campaignId} Crypto`, // name
        `C${campaignId}CRYPTO`, // symbol
        { gasLimit: 2000000 },
      );

      const cryptoReceipt = await cryptoTx.wait();
      
      // Find KeepWhatsRaised deployment event
      const cryptoDeployEvent = cryptoReceipt.events?.find(
        (e: TreasuryDeployedEvent) =>
          e.event === 'TreasuryFactoryTreasuryDeployed',
      );

      if (!cryptoDeployEvent) {
        throw new Error('KeepWhatsRaised treasury deployment event not found');
      }

      const cryptoTreasuryAddress = cryptoDeployEvent.args.treasuryAddress;
      console.log('✓ KeepWhatsRaised Treasury deployed:', cryptoTreasuryAddress);

      // Deploy PaymentTreasury (Credit Card Payments) - Implementation ID: 1
      console.log('2/2 Deploying PaymentTreasury (Credit Card Payments)...');
      const paymentTx = await treasuryFactory.deploy(
        platformConfig.platformBytes, // platformHash
        campaignAddress, // infoAddress (CampaignInfo contract)
        1, // implementationId (1 = PaymentTreasury)
        `Campaign ${campaignId} Payment`, // name
        `C${campaignId}PAY`, // symbol
        { gasLimit: 2000000 },
      );

      const paymentReceipt = await paymentTx.wait();
      
      // Find PaymentTreasury deployment event
      const paymentDeployEvent = paymentReceipt.events?.find(
        (e: TreasuryDeployedEvent) =>
          e.event === 'TreasuryFactoryTreasuryDeployed',
      );

      if (!paymentDeployEvent) {
        throw new Error('PaymentTreasury deployment event not found');
      }

      const paymentTreasuryAddress = paymentDeployEvent.args.treasuryAddress;
      console.log('✓ PaymentTreasury deployed:', paymentTreasuryAddress);

      console.log('✅ Dual treasury deployment completed successfully!');
      
      return {
        cryptoTreasuryAddress,
        paymentTreasuryAddress,
        cryptoTreasuryTx: cryptoTx.hash,
        paymentTreasuryTx: paymentTx.hash,
      };
    },
    [requestWallet],
  );
  
  return { adminApproveCampaign };
}
