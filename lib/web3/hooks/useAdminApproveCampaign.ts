import { useCallback } from 'react';
import { ethers } from '@/lib/web3';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { chainConfig, useWeb3Auth } from '@/lib/web3';
import { enableBypassContractAdmin } from '@/lib/develop';
import { useAuth } from '@/contexts';
import { switchNetwork } from '../switch-network';
import { AdminApproveProcessStates } from '@/types/admin';

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
  const { wallet } = useWeb3Auth();
  const { authenticated } = useAuth();

  const adminApproveCampaign = useCallback(
    async (
      campaignId: number,
      campaignAddress: string,
      onStateChanged: (arg0: keyof typeof AdminApproveProcessStates) => void,
    ) => {
      onStateChanged('setup');
      if (!authenticated) {
        throw new Error('Not signed in');
      }
      if (!campaignId || !campaignAddress) {
        throw new Error('Campaign ID and address are required');
      }
      if (!wallet) {
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
      if (!wallet || !(await wallet.isConnected())) {
        throw new Error('Wallet not connected');
      }
      const walletProvider = await wallet.getEthereumProvider();
      if (!walletProvider) {
        throw new Error('Wallet not supported or connected');
      }

      await switchNetwork({ wallet });
      onStateChanged('switch');

      // Create providers
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerAddress = signer.address;

      // Global params check
      const globalParams = new ethers.Contract(
        platformConfig.globalParamsAddress,
        GlobalParamsABI,
        ethersProvider,
      );
      onStateChanged('requestAdminAddress');
      const platformAdminTx = await globalParams.getPlatformAdminAddress(
        platformConfig.platformBytes,
      );
      const platformAdmin = await platformAdminTx.wait();

      // Admin check
      if (!enableBypassContractAdmin) {
        if (
          platformAdmin.account.toLowerCase() !== signerAddress.toLowerCase()
        ) {
          console.warn(
            'useAdminApproveCampaign: Platform admin address Mismatch',
            { platformAdmin, signerAddress },
          );
          throw new Error('Not authorized as platform admin');
        }
      }
      onStateChanged('treasuryFactory');
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

      onStateChanged('treasuryFactoryWait');
      const receipt = await tx.wait();

      // Find deployment event
      const deployEvent = receipt.events?.find(
        (e: TreasuryDeployedEvent) =>
          e.event === 'TreasuryFactoryTreasuryDeployed',
      );

      if (!deployEvent) {
        console.warn(
          'useAdminApproveCampaign: Events do not contain TreasuryDeployed event',
          receipt,
        );

        throw new Error('Treasury deployment event not found');
      }

      const treasuryAddress = deployEvent.args.treasuryAddress;
      return treasuryAddress;
    },
    [wallet, authenticated],
  );
  return { adminApproveCampaign };
}
