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
      ) as ethers.Contract & {
        getPlatformAdminAddress: (platformHash: string) => Promise<string>;
        checkIfPlatformDataKeyValid: (dataKey: string) => Promise<boolean>;
      };
      onStateChanged('requestAdminAddress');
      let platformAdmin;
      try {
        platformAdmin = await globalParams.getPlatformAdminAddress(
          platformConfig.platformBytes,
        );
      } catch (error) {
        console.error(
          '❌ [AdminApproval] Failed to get platform admin address:',
          error,
        );
        console.error('❌ [AdminApproval] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code:
            error && typeof error === 'object' && 'code' in error
              ? (error as { code: unknown }).code
              : undefined,
          data:
            error && typeof error === 'object' && 'data' in error
              ? (error as { data: unknown }).data
              : undefined,
        });
        throw new Error(
          `Failed to retrieve platform admin address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Admin check
      if (!enableBypassContractAdmin) {
        // Handle both response formats: { account: address } or address directly
        let adminAddress: string;
        if (typeof platformAdmin === 'string') {
          adminAddress = platformAdmin;
        } else if (
          platformAdmin &&
          typeof platformAdmin === 'object' &&
          'account' in platformAdmin &&
          typeof (platformAdmin as { account: unknown }).account === 'string'
        ) {
          adminAddress = (platformAdmin as { account: string }).account;
        } else {
          console.error(
            '❌ [AdminApproval] Invalid platform admin response format:',
            platformAdmin,
          );
          throw new Error('Invalid platform admin address response format');
        }

        if (!adminAddress || !ethers.isAddress(adminAddress)) {
          console.error(
            '❌ [AdminApproval] Invalid admin address:',
            adminAddress,
          );
          throw new Error('Invalid platform admin address');
        }

        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
          console.warn('⚠️ [AdminApproval] Platform admin address mismatch', {
            expected: adminAddress,
            actual: signerAddress,
          });
          throw new Error('Not authorized as platform admin');
        }
      }
      onStateChanged('treasuryFactory');

      // Initialize TreasuryFactory contract
      let treasuryFactory;
      try {
        treasuryFactory = new ethers.Contract(
          platformConfig.treasuryFactoryAddress,
          TreasuryFactoryABI,
          ethersProvider,
        ).connect(signer) as ethers.Contract & {
          interface: {
            getFunction: (name: string) => ethers.FunctionFragment | null;
          };
          deploy: (
            platformHash: string,
            infoAddress: string,
            implementationId: number,
            name: string,
            symbol: string,
          ) => Promise<ethers.ContractTransactionResponse>;
        };
      } catch (contractCreationError) {
        console.error(
          '❌ [AdminApproval] TreasuryFactory contract creation failed:',
          contractCreationError,
        );
        throw new Error(
          `TreasuryFactory contract creation failed: ${contractCreationError instanceof Error ? contractCreationError.message : 'Unknown error'}`,
        );
      }

      // Implementation registration/approval should be done once during platform setup, not per deployment
      // We just deploy using the pre-registered implementation ID 0 (KeepWhat'sRaised)
      console.log(
        'ℹ️ [AdminApproval] Using pre-registered KeepWhatRaised implementation (ID 0)',
      );

      // Verify TreasuryFactory contract exists
      try {
        const factoryCode = await ethersProvider.getCode(
          platformConfig.treasuryFactoryAddress,
        );
        if (factoryCode === '0x' || factoryCode === '0x0') {
          throw new Error(
            'TreasuryFactory contract does not exist at the specified address',
          );
        }
      } catch (contractError) {
        console.error(
          'TreasuryFactory contract verification failed:',
          contractError,
        );
        throw new Error(
          'TreasuryFactory contract is not deployed or accessible',
        );
      }

      // Verify deploy function exists in interface
      const deployFragment = treasuryFactory.interface?.getFunction('deploy');
      if (!deployFragment) {
        throw new Error(
          'TreasuryFactory deploy function not available in contract interface',
        );
      }

      // Verify platform data keys are configured
      const requiredKeys = [
        'flatFee',
        'cumulativeFlatFee',
        'platformFee',
        'vakiCommission',
      ];
      for (const keyName of requiredKeys) {
        const keyHash = ethers.keccak256(ethers.toUtf8Bytes(keyName));
        try {
          const isValid =
            await globalParams.checkIfPlatformDataKeyValid(keyHash);
          if (!isValid) {
            throw new Error(
              `Platform data key missing: ${keyName}. Platform setup required.`,
            );
          }
        } catch (keyError) {
          throw new Error(`Platform data key verification failed: ${keyName}`);
        }
      }

      // Verify campaign address is a valid contract
      try {
        const campaignCode = await ethersProvider.getCode(campaignAddress);
        if (campaignCode === '0x' || campaignCode === '0x0') {
          throw new Error('Campaign address is not a deployed contract');
        }
      } catch (error) {
        throw new Error('Invalid campaign contract address');
      }

      // Deploy treasury server-side
      onStateChanged('treasuryFactoryWait');

      try {
        const deployResponse = await fetch(
          `/api/campaigns/${campaignId}/deploy-treasury`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (!deployResponse.ok) {
          const errorData = await deployResponse.json();
          throw new Error(
            `Treasury deployment failed: ${errorData.error || 'Unknown server error'}`,
          );
        }

        const deployResult = await deployResponse.json();

        if (deployResult.status !== 'success') {
          throw new Error(
            `Treasury deployment failed: ${deployResult.error || 'Unknown error'}`,
          );
        }

        return deployResult.treasuryAddress;
      } catch (deployError) {
        throw new Error(
          `Treasury deployment failed: ${deployError instanceof Error ? deployError.message : 'Unknown error'}`,
        );
      }
    },
    [wallet, authenticated],
  );
  return { adminApproveCampaign };
}
