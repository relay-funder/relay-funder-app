"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, type Address, type Hash, maxUint256 } from "viem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  prepareApproveErc20Args,
  prepareCreatePoolArgs,
  checkErc20Allowance
} from "@/lib/qfInteractions";
import { ALLO_ADDRESS } from "@/lib/constant";

// Define the schema (same as server but could be limited to form fields only)
const roundSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(30, { message: "Description must be at least 30 characters." }),
  matchingPool: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Matching pool must be a non-negative number.",
  }),
  tokenAddress: z.string().refine((val): val is Address => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: "Invalid token address format. Use 0x...",
  }),
  tokenDecimals: z.coerce.number().int().min(0).max(18, "Decimals must be between 0 and 18.").default(6),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  applicationStart: z.string().min(1, "Application start date is required."),
  applicationClose: z.string().min(1, "Application close date is required."),
  logoUrl: z.string().url({ message: "Logo URL must be a valid URL." }).optional().or(z.literal("")),
  profileId: z.string().refine((val): val is Hash => /^0x[a-fA-F0-9]{64}$/.test(val), {
    message: "Invalid Profile ID format. Use 0x... (64 hex chars).",
  }),
});

// Same date validation refinements as server
const refinedRoundSchema = roundSchema.refine(data => {
  try { return new Date(data.applicationClose) > new Date(data.applicationStart) } catch { return false }
}, {
  message: "Application close date must be after application start date.",
  path: ["applicationClose"],
}).refine(data => {
    try { return new Date(data.endDate) > new Date(data.startDate) } catch { return false }
}, {
    message: "Round end date must be after round start date.",
    path: ["endDate"],
}).refine(data => {
    try { return new Date(data.startDate) >= new Date(data.applicationClose) } catch { return false }
}, {
    message: "Round start date must be on or after application close date.",
    path: ["startDate"],
});


type RoundFormData = z.infer<typeof refinedRoundSchema>;

// More granular state management
type SubmissionStatus = 'idle' | 'validating' | 'approving' | 'sending' | 'confirming' | 'success' | 'error';

export default function CreateRoundPage() {
  const router = useRouter();
  const { address: connectedAddress, chain, chainId } = useAccount();
  const { data: writeContractHash, writeContract, isPending: isTxSending, error: writeContractError } = useWriteContract();

  // Form state and validation
  const form = useForm<RoundFormData>({
    resolver: zodResolver(refinedRoundSchema),
    defaultValues: {
      title: "",
      description: "",
      matchingPool: "0",
      tokenAddress: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B", // Example USDC on Sepolia
      tokenDecimals: 6, // USDC default
      startDate: "",
      endDate: "",
      applicationStart: "",
      applicationClose: "",
      logoUrl: "",
      profileId: "0xa345e1bb3e9f075ca7261a5d496b531f4423e4913c2d516a08a8b1688f35e4b6", // Example profile ID
    },
  });

  // Component State
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submittedTxHash, setSubmittedTxHash] = useState<Hash | null>(null); // Store hash for confirmation watching

  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);
  const [requiredAmount, setRequiredAmount] = useState<bigint>(0n);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { watch, handleSubmit, setError, formState: { errors } } = form;
  const matchingPool = watch("matchingPool");
  const tokenAddress = watch("tokenAddress");
  const tokenDecimals = watch("tokenDecimals");

  // --- Transaction Confirmation Watcher ---
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: submittedTxHash ?? undefined, // Watch the hash from writeContract result
    query: {
      enabled: !!submittedTxHash, // Only run when hash is set
    }
  });

  // Update status based on confirmation
  useEffect(() => {
    if (isConfirming) {
      setStatus('confirming');
      setStatusMessage('Waiting for transaction confirmation...');
    } else if (isConfirmed && status === 'confirming') {
      setStatus('success');
      setStatusMessage('Transaction confirmed successfully!');
      // If it was an approval, re-check allowance
      if (statusMessage?.includes('Approving')) {
          handleCheckAllowance(); // Re-check after approval confirmation
      }
    } else if (writeContractError && status === 'sending') {
        // Handle error from useWriteContract hook
        setStatus('error');
        const message = writeContractError?.message?.includes('User rejected')
            ? 'Transaction rejected by user.'
            : `Transaction failed: ${writeContractError?.shortMessage || writeContractError?.message}`;
        setStatusMessage(message);
        setError("root", { type: "manual", message });
        setSubmittedTxHash(null); // Clear hash on error
    }
  }, [isConfirming, isConfirmed, status, writeContractError, setError, statusMessage]);


  // --- Allowance Check ---
  const handleCheckAllowance = useCallback(async () => {
    if (!connectedAddress || !tokenAddress || !matchingPool || Number(matchingPool) <= 0 || !z.string().startsWith("0x").safeParse(tokenAddress).success) {
      setNeedsApproval(false);
      setCurrentAllowance(0n);
      setRequiredAmount(0n);
      return;
    }

    setIsCheckingAllowance(true);
    setNeedsApproval(false); // Reset
    try {
      const decimals = tokenDecimals || 6; // Use default if not set, though form has default
      const amount = parseUnits(matchingPool, decimals);
      setRequiredAmount(amount);

      const allowance = await checkErc20Allowance({
        tokenAddress: tokenAddress as Address,
        ownerAddress: connectedAddress,
        spenderAddress: ALLO_ADDRESS,
        chainId: chainId, // Pass chainId
      });

      setCurrentAllowance(allowance);
      setNeedsApproval(allowance < amount);
    } catch (error) {
      console.error("Error checking allowance:", error);
      setStatusMessage(`Error checking allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error'); // Indicate an error occurred
      setNeedsApproval(true); // Assume approval needed if check fails
    } finally {
      setIsCheckingAllowance(false);
    }
  }, [connectedAddress, tokenAddress, matchingPool, tokenDecimals, chainId]);

  // Effect to check allowance when relevant fields change
  useEffect(() => {
    handleCheckAllowance();
  }, [handleCheckAllowance]); // Dependencies are managed by useCallback

  // --- Handle Token Approval ---
  const handleApprove = async () => {
    if (!connectedAddress || !tokenAddress || !z.string().startsWith("0x").safeParse(tokenAddress).success) {
        setError("root", { type: "manual", message: "Valid Token Address is required for approval." });
        return;
    }

    setStatus('approving');
    setStatusMessage('Preparing approval transaction...');
    setSubmittedTxHash(null); // Clear previous hash

    try {
      const approveArgs = prepareApproveErc20Args({
        tokenAddress: tokenAddress as Address,
        spenderAddress: ALLO_ADDRESS,
        amount: maxUint256, // Approve max
      });

      setStatusMessage('Please confirm approval in your wallet...');
      writeContract(approveArgs, {
          onSuccess: (hash) => {
              setStatus('sending'); // Indicate tx sent, waiting for hook confirmation
              setStatusMessage('Approving token... Tx sent.');
              setSubmittedTxHash(hash); // Set hash to watch for confirmation
              console.log("Approval tx sent:", hash);
          },
          onError: (error) => {
              // Error handled by the useEffect watching writeContractError
              console.error("Approval writeContract call failed:", error);
          }
      });
    } catch (error) {
      console.error("Approval preparation failed:", error);
      setStatus('error');
      const message = `Failed to prepare approval: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setStatusMessage(message);
      setError("root", { type: "manual", message });
    }
  };

  // --- Form Submission ---
  const onSubmit = async (data: RoundFormData) => {
    setStatusMessage(null); // Clear previous messages
    setError("root", { message: "" }); // Clear previous errors

    if (!connectedAddress) {
      setError("root", { type: "manual", message: "Please connect your wallet." });
      return;
    }

    if (needsApproval && Number(data.matchingPool) > 0) {
      setError("root", { type: "manual", message: "Token approval required." });
      return;
    }

    setStatus('sending');
    setStatusMessage('Preparing transaction...');
    setSubmittedTxHash(null); // Clear previous hash

    try {
      // 1. Prepare data for createPool
      const allocationStartTime = BigInt(Math.floor(new Date(data.startDate).getTime() / 1000));
      const allocationEndTime = BigInt(Math.floor(new Date(data.endDate).getTime() / 1000));
      const registrationStartTime = BigInt(Math.floor(new Date(data.applicationStart).getTime() / 1000));
      const registrationEndTime = BigInt(Math.floor(new Date(data.applicationClose).getTime() / 1000));
      const amount = parseUnits(data.matchingPool, data.tokenDecimals);

      // Simple metadata - replace with IPFS upload if needed
      const metadataPointer = JSON.stringify({
        title: data.title,
        description: data.description,
        logo: data.logoUrl,
      });
      const metadata = {
        protocol: 1n, // Assuming IPFS or similar off-chain storage
        pointer: metadataPointer, // In real app, this would be CID after upload
      };

      const recipientInitializeData = {
        metadataRequired: true,
        registrationStartTime,
        registrationEndTime,
      };
      const initializationData = {
        recipientInitializeData,
        allocationStartTime,
        allocationEndTime,
        withdrawalCooldown: 0n, // Example value, adjust if needed
        allowedTokens: [data.tokenAddress],
        isUsingAllocationMetadata: false, // Based on KickstarterQF
      };
      const managers = [connectedAddress]; // Use connected address as manager

      // 2. Get transaction arguments
      const createPoolArgs = prepareCreatePoolArgs({
        profileId: data.profileId,
        initializationData,
        token: data.tokenAddress,
        amount,
        metadata,
        managers,
      });

      // 3. Send transaction using the hook
      setStatusMessage('Please confirm transaction in your wallet...');
      writeContract(createPoolArgs, {
          onSuccess: (hash) => {
              setStatus('sending'); // Still 'sending' until confirmed by watcher
              setStatusMessage('Create round transaction sent. Waiting for confirmation...');
              setSubmittedTxHash(hash); // Set hash for the watcher
              console.log("Create pool tx sent:", hash);
          },
          onError: (error) => {
              // Error handled by the useEffect watching writeContractError
              console.error("Create pool writeContract call failed:", error);
          }
      });

    } catch (error) {
      console.error("Error preparing create round transaction:", error);
      setStatus('error');
      const message = `Failed to prepare transaction: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setStatusMessage(message);
      setError("root", { type: "manual", message });
    }
  };

  // Calculate button disabled states
  const isApproveButtonDisabled = status === 'approving' || status === 'sending' || status === 'confirming' || isCheckingAllowance || !needsApproval;
  const isCreateButtonDisabled = status === 'approving' || status === 'sending' || status === 'confirming' || isCheckingAllowance || (needsApproval && Number(matchingPool) > 0);

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/rounds" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Rounds
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Round</CardTitle>
            <CardDescription>Configure and launch a new funding round on Allo Protocol.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Round Title</FormLabel>
                      <FormControl><Input placeholder="E.g., QF Round 1: Community Grants" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Describe the goals, eligibility, and focus of this funding round." rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Funding Details */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="matchingPool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matching Pool Amount</FormLabel>
                        <FormControl><Input type="number" min="0" step="any" placeholder="e.g., 10000" {...field} /></FormControl>
                        <FormDescription>Initial funds provided by the round manager.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Token Address</FormLabel>
                        <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                        <FormDescription>Address of the ERC20 token used for matching and contributions.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="tokenDecimals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Decimals</FormLabel>
                        <FormControl><Input type="number" min="0" max="18" {...field} /></FormControl>
                        <FormDescription>Decimals of the funding token (e.g., 6 for USDC, 18 for DAI).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="profileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allo Profile ID</FormLabel>
                        <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                        <FormDescription>Your unique Allo Protocol profile identifier (bytes32).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Token Approval Section */}
                {Number(matchingPool) > 0 && tokenAddress && z.string().startsWith("0x").safeParse(tokenAddress).success && (
                  <div className="rounded-md border bg-muted p-4">
                    <h3 className="mb-2 text-sm font-medium">Token Approval for Matching Pool</h3>
                    {isCheckingAllowance ? (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking allowance...</span>
                      </div>
                    ) : needsApproval ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Allowance: {formatUnits(currentAllowance, tokenDecimals || 6)}</span>
                          <span className="font-medium">Required: {formatUnits(requiredAmount, tokenDecimals || 6)}</span>
                        </div>
                        <Progress value={Number(requiredAmount) > 0 ? Number(currentAllowance * 100n / requiredAmount) : 100} className="h-2" />
                        <Button
                          type="button"
                          onClick={handleApprove}
                          disabled={isApproveButtonDisabled}
                          size="sm"
                          className="w-full"
                        >
                          {(status === 'approving' || (status === 'sending' && statusMessage?.includes('Approving')) || (status === 'confirming' && statusMessage?.includes('Approving'))) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Approve Max Token Spend
                        </Button>
                        <p className="text-xs text-muted-foreground">You need to grant the Allo contract permission to transfer your tokens for the matching pool.</p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Sufficient allowance approved.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="applicationStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Start Date</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicationClose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application End Date</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Round Start Date</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormDescription>Contributions can begin.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Round End Date</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormDescription>Contributions end.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields */}
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                      <FormDescription>Link to the round's logo image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Feedback Area */}
                 {(statusMessage || errors.root) && (
                    <Alert variant={status === 'error' || !!errors.root ? "destructive" : status === 'success' ? "default" : "default"} className={status === 'success' ? "border-green-500 text-green-700 dark:border-green-700 dark:text-green-400" : ""}>
                        {status === 'error' || !!errors.root ? <AlertTriangle className="h-4 w-4" /> : status === 'success' ? <CheckCircle className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                        <AlertTitle>
                            {status === 'error' || !!errors.root ? "Error" : status === 'success' ? "Success" : "Status"}
                        </AlertTitle>
                        <AlertDescription>
                            {errors.root?.message || statusMessage}
                            {status === 'success' && submittedTxHash && (
                                <>
                                    <br />
                                    Transaction confirmed: <a href={`${chain?.blockExplorers?.default.url}/tx/${submittedTxHash}`} target="_blank" rel="noopener noreferrer" className="underline">{submittedTxHash}</a>
                                    <br />
                                    <Button variant="link" className="p-0 h-auto mt-2 text-current" onClick={() => router.push('/rounds')}>View Rounds</Button>
                                </>
                            )}
                             {status === 'sending' && submittedTxHash && !isConfirming && ( // Show link while waiting for confirmation
                                <>
                                    <br />
                                    View transaction: <a href={`${chain?.blockExplorers?.default.url}/tx/${submittedTxHash}`} target="_blank" rel="noopener noreferrer" className="underline">{submittedTxHash}</a>
                                </>
                            )}
                        </AlertDescription>
                    </Alert>
                )}


                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/rounds")}
                    disabled={status === 'sending' || status === 'confirming' || status === 'approving'}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreateButtonDisabled}>
                    {(status === 'sending' || status === 'confirming') && !statusMessage?.includes('Approving') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {status === 'success' ? 'Round Created' : 'Create Round'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
