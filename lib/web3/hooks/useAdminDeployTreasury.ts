import { useCallback } from 'react';
import { ethers } from '@/lib/web3';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { useConnectorClient } from '@/lib/web3';
import { debugHook as debug } from '@/lib/debug';
import {
  TREASURY_GAS_LIMITS,
  TREASURY_IMPLEMENTATIONS,
} from '@/lib/constant/treasury';

export interface TreasuryDeploymentResult {
  address: string;
  transactionHash: string;
  deploymentStatus: 'success' | 'failed';
  error?: string;
}

export interface DeployTreasuryParams {
  campaignId: number;
  campaignAddress: string;
  platformBytes: string;
}

export function useAdminDeployTreasury() {
  const { data: client } = useConnectorClient();

  const deployTreasury = useCallback(
    async (params: DeployTreasuryParams): Promise<TreasuryDeploymentResult> => {
      if (!client) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(client);
        const signer = await ethersProvider.getSigner();

        // Initialize TreasuryFactory contract
        const treasuryFactoryAddress = process.env.NEXT_PUBLIC_TREASURY_FACTORY;
        if (!treasuryFactoryAddress) {
          throw new Error('Treasury factory address not configured');
        }

        const treasuryFactory = new ethers.Contract(
          treasuryFactoryAddress,
          TreasuryFactoryABI,
          signer,
        );

        // Validate that campaignAddress is provided
        if (!params.campaignAddress) {
          throw new Error(
            'CampaignInfo address is required for treasury deployment',
          );
        }

        // Deploy treasury using correct TreasuryFactory interface with CampaignInfo address
        const tx = await treasuryFactory.deploy(
          params.platformBytes, // platformHash
          params.campaignAddress, // infoAddress (must be CampaignInfo contract)
          TREASURY_IMPLEMENTATIONS.KEEP_WHATS_RAISED, // implementationId
          'RelayTreasury', // name
          'RLY', // symbol
          { gasLimit: TREASURY_GAS_LIMITS.DEPLOY },
        );

        const receipt = await tx.wait();

        if (receipt.status !== 1) {
          throw new Error(
            `Treasury deployment transaction failed with status: ${receipt.status}`,
          );
        }

        // Extract treasury address from event logs using topic signature
        let treasuryAddress = null;
        // Compute the topic hash from the event signature instead of hardcoding
        const expectedTopic = ethers.id(
          'TreasuryFactoryTreasuryDeployed(bytes32,uint256,address,address)',
        );

        for (const log of receipt.logs || []) {
          if (!log.topics || log.topics[0] !== expectedTopic) {
            continue;
          }

          if (!log.data) {
            continue;
          }

          // Remove zero padding from the beginning to get clean address
          const cleanData = log.data.replace(/^0x0{24}/, '0x');
          if (cleanData.length === 42 && cleanData.startsWith('0x')) {
            // Valid address format
            treasuryAddress = cleanData;
            break;
          }
        }

        if (!treasuryAddress) {
          throw new Error(
            'Treasury deployment event not found or could not extract treasury address',
          );
        }

        debug && console.log(`Treasury deployed at: ${treasuryAddress}`);
        debug && console.log(`Transaction hash: ${tx.hash}`);

        return {
          address: treasuryAddress,
          transactionHash: tx.hash,
          deploymentStatus: 'success',
        };
      } catch (error) {
        console.error('Treasury deployment error:', error);
        return {
          address: '',
          transactionHash: '',
          deploymentStatus: 'failed',
          error:
            error instanceof Error ? error.message : 'Unknown deployment error',
        };
      }
    },
    [client],
  );

  return { deployTreasury };
}
