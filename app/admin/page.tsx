'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import { AdminAccessDenied } from '@/components/admin/access-denied';
import { AdminLoading } from '@/components/admin/loading';
import { useAdminApproveCampaign as useAdminApproveWeb3Campaign } from '@/lib/web3/hooks/useAdminApproveCampaign';
import { useAdminApproveCampaign } from '@/lib/hooks/useCampaigns';
import { enableBypassContractAdmin } from '@/lib/develop';
import { useInfiniteCampaigns } from '@/lib/hooks/useCampaigns';
import { useInView } from 'react-intersection-observer';
import { CampaignCardAdmin } from '@/components/campaign/card-admin';
import { CampaignLoading } from '@/components/campaign/loading';
import { type Campaign } from '@/types/campaign';
import { DashboardOverview } from '@/components/dashboard/overview';
import { useWeb3Auth } from '@/lib/web3';
import { useNetworkCheck } from '@/hooks/use-network';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

function AdminPageContent() {
  const { isAdmin, isReady, authenticated } = useAuth();
  const { toast } = useToast();
  const { ready: walletReady } = useWeb3Auth();
  const { isCorrectNetwork } = useNetworkCheck();

  const [error, setError] = useState<string | null>(null);
  const { adminApproveCampaign: adminApproveWeb3Campaign } =
    useAdminApproveWeb3Campaign();

  const { mutateAsync: adminApproveCampaign } = useAdminApproveCampaign();
  /* TODO: Implement rounds functionality
   * - Add state management for rounds
   * - Add state for selected rounds
   * - Add state for dropdown visibility
   */
  // const [rounds, setRounds] = useState<{ id: number; title: string }[]>([]);
  // const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  // const [dropdownStates, setDropdownStates] = useState<{ [key: number]: boolean }>({});

  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCampaigns('all', 10, true);
  const filteredCampaignPages = useMemo(() => {
    return data?.pages;
  }, [data]);

  const approveCampaign = useCallback(
    async (campaignId: number, campaignAddress: string) => {
      try {
        // Check wallet connection for Web3 operations (unless bypassing)
        if (!enableBypassContractAdmin) {
          if (!authenticated) {
            throw new Error('Please connect your wallet to perform admin operations');
          }
          if (!walletReady) {
            throw new Error('Wallet is not ready. Please ensure your wallet is connected');
          }
          if (!isCorrectNetwork) {
            throw new Error('Please switch to the correct network before approving campaigns');
          }
        }

        if (enableBypassContractAdmin) {
          await adminApproveCampaign({ 
            campaignId, 
            treasuryAddress: 'mock-treasury-address' 
          });
        } else {
          const deploymentResult = await adminApproveWeb3Campaign(campaignId, campaignAddress);
          await adminApproveCampaign({ 
            campaignId, 
            treasuryAddress: deploymentResult.cryptoTreasuryAddress,
            cryptoTreasuryAddress: deploymentResult.cryptoTreasuryAddress,
            paymentTreasuryAddress: deploymentResult.paymentTreasuryAddress,
            cryptoTreasuryTx: deploymentResult.cryptoTreasuryTx,
            paymentTreasuryTx: deploymentResult.paymentTreasuryTx
          });
        }

        toast({
          title: 'Success',
          description: 'Campaign has been approved successfully',
        });
      } catch (err) {
        console.error('Error approving campaign:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to approve campaign',
        );
        toast({
          title: 'Error',
          description:
            err instanceof Error ? err.message : 'Failed to approve campaign',
          variant: 'destructive',
        });
      }
    },
    [toast, adminApproveCampaign, adminApproveWeb3Campaign, authenticated, walletReady, isCorrectNetwork],
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* TODO: Implement campaign round association functionality
   * - Add API endpoint for campaign-round association
   * - Implement error handling and validation
   * - Add success/error notifications
   * - Handle state updates after successful association
   */
  // const addCampaignToRounds = async (campaignId: number) => {
  //   try {
  //     const response = await fetch(`/api/campaigns/round`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         campaignId,
  //         roundIds: selectedRounds,
  //       }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to add campaign to rounds");
  //     }
  //     toast({
  //       title: "Success",
  //       description: "Campaign added to selected rounds successfully.",
  //     });
  //     setSelectedRounds([]); // Clear selection after successful submission
  //     toggleDropdown(campaignId); // Close dropdown
  //   } catch (err) {
  //     console.error("Error adding campaign to rounds:", err);
  //     setError(err instanceof Error ? err.message : "An error occurred");
  //   }
  // };

  /* TODO: Implement dropdown toggle functionality
   * - Add state management for dropdown visibility
   * - Implement toggle logic for each campaign
   * - Add keyboard accessibility
   * - Consider adding animation for smooth transitions
   */
  // const toggleDropdown = (campaignId: number) => {
  //   setDropdownStates((prev) => ({
  //     ...prev,
  //     [campaignId]: !prev[campaignId],
  //   }));
  // };

  if (!isReady) {
    return <AdminLoading />;
  }
  // Show access denied if not admin
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => setError(null)}>Reset</Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (isLoading && !data) {
    return <CampaignLoading minimal={true} />;
  }
  // Main content
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <div className="mx-auto max-w-7xl p-5">
        <div className="mb-8 pt-5 text-3xl font-bold">Admin Dashboard</div>

        {/* Wallet Connection Status for Web3 Operations */}
        {!enableBypassContractAdmin && (
          <div className="mb-6">
            <Alert className={`${authenticated && walletReady && isCorrectNetwork ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <Wallet className="h-4 w-4" />
              <AlertTitle>Wallet Status for Campaign Approvals</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  {!authenticated ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Wallet not connected. Connect your wallet to approve campaigns.</span>
                    </div>
                  ) : !walletReady ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting to wallet...</span>
                    </div>
                  ) : !isCorrectNetwork ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span>Wrong network. Switch to the correct network to approve campaigns.</span>
                      </div>
                      <PaymentSwitchWalletNetwork />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Wallet connected and ready for campaign approvals</span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Admin Configuration Debug Info */}
        {!enableBypassContractAdmin && (
          <div className="mb-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Admin Configuration</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm font-mono">
                  <div><strong>Expected Platform Admin:</strong> {process.env.NEXT_PUBLIC_PLATFORM_ADMIN || 'Not configured'}</div>
                  <div><strong>Current Connected Wallet:</strong> {authenticated ? 'Check browser console for address' : 'Not connected'}</div>
                  <div><strong>Platform Hash:</strong> {process.env.NEXT_PUBLIC_PLATFORM_HASH || 'Not configured'}</div>
                  <div><strong>Global Params Contract:</strong> {process.env.NEXT_PUBLIC_GLOBAL_PARAMS || 'Not configured'}</div>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Connect the wallet with the expected platform admin address to approve campaigns. Check browser console for detailed address comparison.
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {filteredCampaignPages?.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No campaigns found.</p>
          </div>
        ) : (
          <>
            <DashboardOverview
              campaigns={[] /* TODO: api for global stats */}
            />
            {/* Campaign Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaignPages?.map((page) =>
                page.campaigns.map((campaign: Campaign) => (
                  <CampaignCardAdmin
                    campaign={campaign}
                    key={campaign.id}
                    onApprove={approveCampaign}
                  />
                )),
              )}
            </div>
            {isFetchingNextPage && <CampaignLoading minimal={true} />}
            <div ref={ref} className="h-10" />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Web3ContextProvider>
      <AdminPageContent />
    </Web3ContextProvider>
  );
}
