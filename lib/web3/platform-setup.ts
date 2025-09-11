import { ethers } from 'ethers';
import { GlobalParamsABI } from '@/contracts/abi/GlobalParams';
import { TreasuryFactoryABI } from '@/contracts/abi/TreasuryFactory';
import { chainConfig } from '@/lib/web3';

/**
 * Platform setup utilities to ensure proper configuration before campaign creation
 */

export async function ensurePlatformSetup(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

    // Platform configuration from environment
    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
    const globalParamsAddress = process.env.NEXT_PUBLIC_GLOBAL_PARAMS;
    const treasuryFactoryAddress = process.env.NEXT_PUBLIC_TREASURY_FACTORY;
    const platformAdminKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
    const protocolAdminKey = process.env.PROTOCOL_ADMIN_PRIVATE_KEY;
    const keepWhatsRaisedImpl = process.env.NEXT_PUBLIC_KEEP_WHATS_RAISED_IMPLEMENTATION;

    if (!platformHash || !globalParamsAddress || !treasuryFactoryAddress || !platformAdminKey || !protocolAdminKey) {
      return {
        success: false,
        error: 'Missing required environment variables for platform setup'
      };
    }

    // Check if GlobalParams contract exists
    try {
      const code = await provider.getCode(globalParamsAddress);
      if (code === '0x') {
        return {
          success: false,
          error: `GlobalParams contract not found at address ${globalParamsAddress}. Please verify the contract is deployed on the network.`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to check GlobalParams contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    const platformAdminSigner = new ethers.Wallet(platformAdminKey, provider);
    const protocolAdminSigner = new ethers.Wallet(protocolAdminKey, provider);

    // 1. Check if platform is enlisted
    console.log('Checking platform enlistment...');
    const globalParams = new ethers.Contract(globalParamsAddress, GlobalParamsABI, provider) as ethers.Contract & {
      checkIfplatformIsListed: (platformHash: string) => Promise<boolean>;
      enlistPlatform: (platformHash: string, adminAddress: string, feePercent: number) => Promise<ethers.ContractTransactionResponse>;
      addPlatformData: (platformHash: string, dataKey: string) => Promise<ethers.ContractTransactionResponse>;
      checkIfPlatformDataKeyValid: (dataKey: string) => Promise<boolean>;
    };

    let isListed: boolean;
    try {
      isListed = await globalParams.checkIfplatformIsListed(platformHash);
      console.log(`Platform enlistment status: ${isListed}`);
    } catch (error: unknown) {
      console.error('Error calling checkIfplatformIsListed:', error);

      // If the contract call fails due to revert, assume platform needs enlistment
      // This can happen if the platform was never enlisted or if there's a contract issue
      if (error && typeof error === 'object' &&
          (('code' in error && error.code === 'CALL_EXCEPTION') ||
           ('shortMessage' in error && error.shortMessage === 'missing revert data'))) {
        console.log('Platform validation function reverted - proceeding with enlistment');
        isListed = false; // Force enlistment
      } else {
        return {
          success: false,
          error: `Failed to check platform status: ${error instanceof Error ? error.message : 'Contract call failed'}. Please verify the GlobalParams contract is properly deployed and accessible.`
        };
      }
    }

    if (!isListed) {
      console.log('Enlisting platform...');
      const enlistTx = await (globalParams.connect(protocolAdminSigner) as typeof globalParams).enlistPlatform(
        platformHash,
        process.env.NEXT_PUBLIC_PLATFORM_ADMIN!,
        1000 // 10.00% platform fee (in basis points: 1000 = 10%)
      );
      await enlistTx.wait();
      console.log('Platform enlisted successfully');
    }

    // 2. Add platform data keys
    console.log('Setting up platform data keys...');
    const globalParamsWithSigner = globalParams.connect(platformAdminSigner) as typeof globalParams;

    const feeKeys = [
      'flatFee',
      'cumulativeFlatFee',
      'platformFee',
      'vakiCommission'
    ];

    for (const keyName of feeKeys) {
      const keyHash = ethers.keccak256(ethers.toUtf8Bytes(keyName));
      const isValid = await globalParams.checkIfPlatformDataKeyValid(keyHash);

      if (!isValid) {
        console.log(`Adding platform data key: ${keyName}`);
        const addKeyTx = await globalParamsWithSigner.addPlatformData(platformHash, keyHash);
        await addKeyTx.wait();
      }
    }

    // 3. Register KeepWhatsRaised implementation
    if (keepWhatsRaisedImpl) {
      console.log('Registering KeepWhatsRaised implementation...');
      const treasuryFactory = new ethers.Contract(treasuryFactoryAddress, TreasuryFactoryABI, provider) as ethers.Contract & {
        registerTreasuryImplementation: (platformHash: string, implementationId: number, implementation: string) => Promise<ethers.ContractTransactionResponse>;
        approveTreasuryImplementation: (platformHash: string, implementationId: number) => Promise<ethers.ContractTransactionResponse>;
      };
      const treasuryFactoryWithSigner = treasuryFactory.connect(platformAdminSigner) as typeof treasuryFactory;

      const registerTx = await treasuryFactoryWithSigner.registerTreasuryImplementation(
        platformHash,
        0, // implementation ID for KeepWhatsRaised
        keepWhatsRaisedImpl
      );
      await registerTx.wait();

      // 4. Approve implementation
      console.log('Approving KeepWhatsRaised implementation...');
      const treasuryFactoryWithProtocol = treasuryFactory.connect(protocolAdminSigner) as typeof treasuryFactory;
      const approveTx = await treasuryFactoryWithProtocol.approveTreasuryImplementation(platformHash, 0);
      await approveTx.wait();
    }

    console.log('Platform setup completed successfully');
    return { success: true };

  } catch (error) {
    console.error('Platform setup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown platform setup error'
    };
  }
}

export async function validatePlatformSetup(): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

    const platformHash = process.env.NEXT_PUBLIC_PLATFORM_HASH;
    const globalParamsAddress = process.env.NEXT_PUBLIC_GLOBAL_PARAMS;
    const treasuryFactoryAddress = process.env.NEXT_PUBLIC_TREASURY_FACTORY;

    if (!platformHash || !globalParamsAddress || !treasuryFactoryAddress) {
      issues.push('Missing required environment variables');
      return { isValid: false, issues };
    }

    // Check if GlobalParams contract exists
    try {
      const code = await provider.getCode(globalParamsAddress);
      if (code === '0x') {
        issues.push(`GlobalParams contract not found at address ${globalParamsAddress}`);
        return { isValid: false, issues };
      }
    } catch (error) {
      issues.push(`Failed to check GlobalParams contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues };
    }

    // Check GlobalParams contract
    const globalParams = new ethers.Contract(globalParamsAddress, GlobalParamsABI, provider) as ethers.Contract & {
      checkIfplatformIsListed: (platformHash: string) => Promise<boolean>;
      getPlatformAdminAddress: (platformHash: string) => Promise<string>;
      checkIfPlatformDataKeyValid: (dataKey: string) => Promise<boolean>;
    };

    // Verify platform is listed
    let isListed: boolean;
    let platformCheckFailed = false;

    try {
      isListed = await globalParams.checkIfplatformIsListed(platformHash);
      console.log(`Platform enlistment status: ${isListed}`);
    } catch (error: unknown) {
      console.error('Error calling checkIfplatformIsListed:', error);

      // If the contract call fails due to revert, assume platform needs enlistment
      // This can happen if the platform was never enlisted or if there's a contract issue
      if (error && typeof error === 'object' &&
          (('code' in error && error.code === 'CALL_EXCEPTION') ||
           ('shortMessage' in error && error.shortMessage === 'missing revert data'))) {
        console.log('Platform validation function reverted - assuming platform needs to be enlisted');
        isListed = false;
        platformCheckFailed = true;
      } else {
        issues.push(`Failed to check platform status: ${error instanceof Error ? error.message : 'Contract call failed'}`);
        return { isValid: false, issues };
      }
    }

    if (!isListed) {
      if (platformCheckFailed) {
        issues.push('Platform validation failed: Unable to verify enlistment status. Platform may need to be enlisted manually.');
      } else {
        issues.push('Platform is not enlisted in GlobalParams');
      }
    }

    // Verify platform data keys
    const requiredKeys = ['flatFee', 'cumulativeFlatFee', 'platformFee', 'vakiCommission'];
    for (const keyName of requiredKeys) {
      const keyHash = ethers.keccak256(ethers.toUtf8Bytes(keyName));
      const isValid = await globalParams.checkIfPlatformDataKeyValid(keyHash);
      if (!isValid) {
        issues.push(`Platform data key missing: ${keyName}`);
      }
    }

    // Check TreasuryFactory
    // Note: We can't easily check implementation registration without admin keys
    // This would require additional setup logic

    return {
      isValid: issues.length === 0,
      issues
    };

  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, issues };
  }
}
