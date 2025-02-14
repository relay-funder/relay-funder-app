import { Wallet } from 'ethers';

interface NidParams {
    proofHash: string;
    signature: string;
    publicKey: string;
}

interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
}

interface NFTCreateParams {
    nid: string;
    network: string;
    contractAddress: string;
    metadata: NFTMetadata;
    options: {
        gasLimit: number;
        gasPrice: string;
    };
}

interface NFTCreateResult {
    network: string;
    contractAddress: string;
    tokenId: number;
    metadata: NFTMetadata;
    transactionHash: string;
}

declare module '@numbersprotocol/nit' {
    export function getIntegrityHash(data: Buffer): Promise<string>;
    export function signIntegrityHash(hash: string, signer: Wallet): Promise<string>;
    export function verifyIntegrityHash(hash: string, signature: string): Promise<string>;
    export function generateNid(params: NidParams): Promise<string>;
    
    export namespace nft {
        export function create(params: NFTCreateParams): Promise<NFTCreateResult>;
    }
} 