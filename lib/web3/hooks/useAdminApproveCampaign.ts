import { useCallback } from 'react';
import { ethers } from '@/lib/web3';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { chainConfig, useWeb3Auth, useConnectorClient } from '@/lib/web3';
import { enableBypassContractAdmin } from '@/lib/develop';
import { useAuth } from '@/contexts';
import { switchNetwork } from '../switch-network';
import { AdminApproveProcessStates } from '@/types/admin';
import { debugHook as debug } from '@/lib/debug';
import {
  getValidationSummary,
  ValidationStage,
} from '@/lib/ccp-validation/campaign-validation';
import { normalizeAddress } from '@/lib/normalize-address';

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
  const { data: client } = useConnectorClient();

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
      if (!client) {
        throw new Error('Wallet not supported or connected');
      }

      await switchNetwork({ client });
      onStateChanged('switch');

      // Create providers
      const ethersProvider = new ethers.BrowserProvider(client);
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

        if (
          normalizeAddress(adminAddress) !== normalizeAddress(signerAddress)
        ) {
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
      debug &&
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
      const network = await ethersProvider.getNetwork();
      debug &&
        console.log(
          'Verifying campaign contract:',
          campaignAddress,
          'on chain',
          network.chainId,
        );

      try {
        // handle RPC sync issues
        let campaignCode = await ethersProvider.getCode(campaignAddress);
        debug &&
          console.log(
            'Campaign contract code:',
            campaignCode.slice(0, 20),
            campaignCode.length,
          );

        // If empty, try with the configured RPC provider as fallback
        if (campaignCode === '0x' || campaignCode === '0x0') {
          debug && console.log('Retrying with configured RPC provider...');
          const configuredRpcUrl =
            process.env.NEXT_PUBLIC_RPC_URL || chainConfig.rpcUrl;
          const directProvider = new ethers.JsonRpcProvider(configuredRpcUrl);
          campaignCode = await directProvider.getCode(campaignAddress);
          debug &&
            console.log(
              'Campaign contract code (RPC 2):',
              campaignCode.slice(0, 20),
              campaignCode.length,
            );
        }

        if (campaignCode === '0x' || campaignCode === '0x0') {
          throw new Error(
            `Campaign address ${campaignAddress} is not a deployed contract (no bytecode found on chain ${network.chainId}). Contract may be recently deployed and not yet synced across all RPC nodes.`,
          );
        }
      } catch (error) {
        console.error('Campaign contract verification failed:', error);
        throw new Error(
          `Invalid campaign contract address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Get campaign data for validation
      const campaignResponse = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!campaignResponse.ok) {
        const errorData = await campaignResponse.json();
        throw new Error(
          `Failed to fetch campaign: ${errorData.error || 'Unknown error'}`,
        );
      }

      const { campaign } = await campaignResponse.json();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Validate campaign before treasury deployment
      debug && console.log('Validating campaign before treasury deployment...');
      const validation = getValidationSummary(campaign, ValidationStage.ACTIVE);
      if (!validation.canProceed) {
        throw new Error(
          `Campaign validation failed: ${validation.messages.join(', ')}. Cannot deploy treasury.`,
        );
      }
      debug &&
        console.log(
          'Campaign validation passed, proceeding with deployment...',
        );

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
    [wallet, authenticated, client],
  );
  return { adminApproveCampaign };
}
