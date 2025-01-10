"use client"
// -- will be removed later
import { useState } from 'react';
import { ethers } from 'ethers';
import { CampaignInfoABI } from '../../contracts/abi/CampaignInfo';

export default function CampaignStatus() {
    const [campaignAddress, setCampaignAddress] = useState('');
    const [platformBytes, setPlatformBytes] = useState('');
    const [status, setStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const checkApprovalStatus = async () => {
        setIsLoading(true);
        setError('');
        setStatus('');

        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to check campaign status');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Request wallet connection
            console.log('provider', provider)

            console.log('platformBytes', platformBytes)

            const campaignContract = new ethers.Contract(campaignAddress, CampaignInfoABI, provider);
            console.log('campaignContract', campaignContract)

            const isPlatformSelected = await campaignContract.checkIfPlatformSelected(platformBytes);
            console.log('isPlatformSelected', isPlatformSelected)

            if (!isPlatformSelected) {
                setStatus('Platform not selected for this campaign');
                return;
            }

            try {
                await campaignContract.getTotalRaisedAmount();
                setStatus('Campaign is approved by platform admin');
                console.log('approved')
            } catch (err) {
                setStatus('Campaign is not yet approved by platform admin');
                console.log('not approved', err)
            }

            console.log('status', status)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h1 className="text-2xl font-bold mb-8">Campaign Approval Status</h1>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Campaign Address
                                    </label>
                                    <input
                                        type="text"
                                        value={campaignAddress}
                                        onChange={(e) => setCampaignAddress(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="0x..."
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Platform Bytes32
                                    </label>
                                    <input
                                        type="text"
                                        value={platformBytes}
                                        onChange={(e) => setPlatformBytes(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="0x..."
                                    />
                                </div>

                                <button
                                    onClick={checkApprovalStatus}
                                    disabled={isLoading}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                >
                                    {isLoading ? 'Checking...' : 'Check Status'}
                                </button>

                                {status && (
                                    <div className="mt-4 p-4 bg-green-100 rounded">
                                        {status}
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                                        Error: {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}