import { useCallback } from 'react';
import { useAuth } from '@/contexts';
import { ethers } from 'ethers';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { chainConfig } from '@/lib/web3';
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
    campaignInfo: string;
  };
}
export function useAdminApproveCampaign() {
  const { wallet } = useAuth();
  const adminApproveCampaign = useCallback(
    async (campaignId: number, campaignAddress: string) => {
      if (!campaignId || !campaignAddress) {
        throw new Error('Campaign ID and address are required');
      }
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
          params: [{ chainId: chainConfig.chainId.hex }],
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
        chainId: chainConfig.chainId.decimal,
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
      // Initialize TreasuryFactory contract
      const treasuryFactory = new ethers.Contract(
        platformConfig.treasuryFactoryAddress,
        TreasuryFactoryABI,
        signer,
      );

      // Deploy treasury
      const tx = await treasuryFactory.deploy(
        platformConfig.platformBytes,
        0,
        campaignAddress,
        { gasLimit: 100000 },
      );

      const receipt = await tx.wait();

      // Find deployment event
      const deployEvent = receipt.events?.find(
        (e: TreasuryDeployedEvent) =>
          e.event === 'TreasuryFactoryTreasuryDeployed',
      );

      if (!deployEvent) {
        throw new Error('Treasury deployment event not found');
      }

      const treasuryAddress = deployEvent.args.treasuryAddress;
      return treasuryAddress;
    },
    [wallet],
  );
  return { adminApproveCampaign };
}
