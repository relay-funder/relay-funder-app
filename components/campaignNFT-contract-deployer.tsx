'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CAMPAIGN_NFT_FACTORY } from '@/lib/constant';
import { CampaignNFTFactory } from '@/contracts/nftABI/CampaignNFTFactory';
import { parseEther } from 'viem';

export default function CampaignDeployer() {
    const { address } = useAccount();
    const [campaignId, setCampaignId] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [defaultTokenURI, setDefaultTokenURI] = useState('');
    const [minDonationAmount, setMinDonationAmount] = useState('0.01');
    const [deploymentStatus, setDeploymentStatus] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);

    // Use the newer writeContract hook directly
    const {
        writeContract,
        isPending,
        isSuccess,
        isError,
        error
    } = useWriteContract();

    // Handle deployment status changes
    useEffect(() => {
        if (isSuccess && isDeploying) {
            setDeploymentStatus('Campaign NFT contract deployed successfully!');
            setIsDeploying(false);
        }

        if (isError && isDeploying) {
            setDeploymentStatus(`Error deploying campaign: ${error?.message || 'Unknown error'}`);
            setIsDeploying(false);
        }
    }, [isSuccess, isError, isDeploying, error]);

    const handleDeployment = async () => {
        if (!address) {
            setDeploymentStatus('Please connect your wallet first');
            return;
        }

        if (!campaignId || !campaignName || !symbol || !defaultTokenURI) {
            setDeploymentStatus('Please fill in all required fields');
            return;
        }

        try {
            setIsDeploying(true);
            setDeploymentStatus('Deploying your campaign NFT contract...');

            writeContract({
                address: CAMPAIGN_NFT_FACTORY as `0x${string}`,
                abi: CampaignNFTFactory,
                functionName: 'createCampaignNFT',
                args: [
                    campaignId,
                    campaignName,
                    symbol,
                    defaultTokenURI,
                    parseEther(minDonationAmount || '0'),
                    address || '0x0000000000000000000000000000000000000000',
                    address || '0x0000000000000000000000000000000000000000', // Using deployer as treasury for simplicity
                ]
            });
        } catch (err) {
            console.error('Error deploying campaign:', err);
            setDeploymentStatus(`Error deploying campaign: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setIsDeploying(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Deploy New Campaign NFT Contract</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign ID (unique identifier)
                    </label>
                    <input
                        type="text"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., campaign-001"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign Name
                    </label>
                    <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., My Awesome Campaign"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token Symbol
                    </label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., CAMP"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Token URI (IPFS link to default metadata)
                    </label>
                    <input
                        type="text"
                        value={defaultTokenURI}
                        onChange={(e) => setDefaultTokenURI(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ipfs://..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Donation Amount (ETH)
                    </label>
                    <input
                        type="number"
                        value={minDonationAmount}
                        onChange={(e) => setMinDonationAmount(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.01"
                        step="0.001"
                        min="0"
                    />
                </div>

                <button
                    onClick={handleDeployment}
                    disabled={isPending || !writeContract} 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Deploying...' : 'Deploy Campaign NFT Contract'}
                </button>

                {deploymentStatus && (
                    <div className={`p-3 rounded-md ${deploymentStatus.includes('successfully')
                        ? 'bg-green-100 text-green-800'
                        : deploymentStatus.includes('Error')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {deploymentStatus}
                    </div>
                )}
            </div>
        </div>
    );
}