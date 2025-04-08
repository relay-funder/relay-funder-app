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
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Database } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, type Address, type Hash, maxUint256, decodeEventLog } from "viem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  prepareApproveErc20Args,
  prepareCreatePoolArgs,
  checkErc20Allowance
} from "@/lib/qfInteractions";
import { ALLO_ADDRESS, KICKSTARTER_QF_ADDRESS } from "@/lib/constant";
import { AlloABI } from '@/contracts/abi/qf/Allo'
import { saveRoundAction } from "@/lib/actions/rounds/createRound";

// Define the schema
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

// Same date validation refinements
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
type SubmissionStatus = 'idle' | 'validating' | 'approving' | 'sending' | 'confirming' | 'saving' | 'success' | 'error';

export default function CreateRoundPage() {
  const router = useRouter();
  const { address: connectedAddress, chain, chainId } = useAccount();
  const { writeContract, error: writeContractError, reset: resetWriteContract } = useWriteContract();

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
  const [submittedTxHash, setSubmittedTxHash] = useState<Hash | null>(null);
  const [finalRoundId, setFinalRoundId] = useState<number | null>(null);

  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);
  const [requiredAmount, setRequiredAmount] = useState<bigint>(0n);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Ref to store form data upon successful transaction submission
  const confirmedTxDataRef = useRef<RoundFormData | null>(null);

  const { watch, handleSubmit, setError, formState: { errors } } = form;
  const matchingPool = watch("matchingPool");
  const tokenAddress = watch("tokenAddress");
  const tokenDecimals = watch("tokenDecimals");

  // --- Transaction Confirmation Watcher ---
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, isError: isConfirmError } = useWaitForTransactionReceipt({
    hash: submittedTxHash ?? undefined,
    query: {
      enabled: !!submittedTxHash && (status === 'sending' || status === 'confirming'),
    }
  });

  // Effect to handle transaction confirmation and trigger DB save
  useEffect(() => {
    if (isConfirming && status !== 'confirming') { // Only set confirming status once
      setStatus('confirming');
      setStatusMessage('Waiting for transaction confirmation (this may take a moment)...');
    } else if (isConfirmed && receipt && status === 'confirming' && confirmedTxDataRef.current) {
      // Transaction confirmed, now save to DB
      setStatus('saving');
      setStatusMessage('Transaction confirmed. Saving round details to database...');
      console.log("Transaction confirmed, receipt:", receipt);

      // --- Parse Pool ID from Logs ---
      let parsedPoolId: bigint | null = null;
      try {
        for (const log of receipt.logs) {
          // Ensure log address matches Allo contract address
          if (log.address.toLowerCase() === ALLO_ADDRESS.toLowerCase()) {
            try {
              const event = decodeEventLog({
                abi: AlloABI,
                data: log.data,
                topics: log.topics,
              });
              if (event.eventName === 'PoolCreated') {
                parsedPoolId = (event.args as { poolId?: bigint }).poolId ?? null;
                console.log("Parsed Pool ID:", parsedPoolId);
                break;
              }
            } catch (decodeError) { /* Ignore logs that don't match */ }
          }
        }

        if (parsedPoolId === null) {
          throw new Error("Could not find PoolCreated event log or parse poolId.");
        }

      } catch (error) {
        console.error("Error parsing poolId from logs:", error);
        setStatus('error');
        setStatusMessage(`Transaction confirmed, but failed to parse Pool ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setError("root", { type: "manual", message: "Failed to process transaction logs." });
        return; // Stop processing
      }

      // --- Call Server Action to Save ---
      const formData = confirmedTxDataRef.current;
      if (!connectedAddress || !chainId) {
        setStatus('error');
        setStatusMessage('Wallet disconnected or chain ID missing before saving.');
        return;
      }

      saveRoundAction({
        ...formData,
        poolId: parsedPoolId,
        blockchain: chainId.toString(),
        transactionHash: receipt.transactionHash,
        managerAddress: connectedAddress,
        strategyAddress: KICKSTARTER_QF_ADDRESS,
      }).then(result => {
        if (result.success && result.data?.roundId) {
          setStatus('success');
          setStatusMessage(`Round created and saved successfully! (ID: ${result.data.roundId})`);
          setFinalRoundId(result.data.roundId);
          confirmedTxDataRef.current = null;
          resetWriteContract();
        } else {
          setStatus('error');
          setStatusMessage(`Transaction confirmed, but failed to save round data: ${result.error || 'Unknown database error'}`);
          setError("root", { type: "manual", message: result.error || "Failed to save round to database." });
        }
      }).catch(error => {
        console.error("Error calling saveRoundAction:", error);
        setStatus('error');
        setStatusMessage(`Transaction confirmed, but encountered server error during save: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setError("root", { type: "manual", message: "Server error while saving round." });
      });

    } else if (isConfirmError && status === 'confirming') {
      setStatus('error');
      setStatusMessage('Transaction failed to confirm on-chain.');
      setError("root", { type: "manual", message: "Transaction failed confirmation." });
      confirmedTxDataRef.current = null;
    } else if (writeContractError && (status === 'sending' || status === 'approving')) {
      setStatus('error');
      const shortMessage = writeContractError instanceof BaseError ? writeContractError.shortMessage : writeContractError?.message;

      const message = writeContractError?.message?.includes('User rejected')
        ? 'Transaction rejected by user.'
        : `Transaction failed: ${shortMessage || 'Unknown error'}`;
      setStatusMessage(message);
      setError("root", { type: "manual", message });
      setSubmittedTxHash(null);
      confirmedTxDataRef.current = null;
    }
  }, [
    isConfirming, isConfirmed, isConfirmError, receipt, status, writeContractError,
    setError, chainId, connectedAddress, resetWriteContract
  ]);


  // --- Allowance Check ---
  const handleCheckAllowance = useCallback(async () => {
    if (!connectedAddress || !tokenAddress || !matchingPool || Number(matchingPool) <= 0 || !z.string().startsWith("0x").safeParse(tokenAddress).success) {
      setNeedsApproval(false);
      setCurrentAllowance(0n);
      setRequiredAmount(0n);
      return;
    }

    setIsCheckingAllowance(true);
    setNeedsApproval(false);
    try {
      const decimals = tokenDecimals || 6;
      const amount = parseUnits(matchingPool, decimals);
      setRequiredAmount(amount);

      const allowance = await checkErc20Allowance({
        tokenAddress: tokenAddress as Address,
        ownerAddress: connectedAddress,
        spenderAddress: ALLO_ADDRESS,
        chainId: chainId,
      });

      setCurrentAllowance(allowance);
      setNeedsApproval(allowance < amount);
    } catch (error) {
      console.error("Error checking allowance:", error);
      setStatusMessage(`Error checking allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setNeedsApproval(true);
    } finally {
      setIsCheckingAllowance(false);
    }
  }, [connectedAddress, tokenAddress, matchingPool, tokenDecimals, chainId]);

  // Effect to check allowance when relevant fields change
  useEffect(() => {
    handleCheckAllowance();
  }, [handleCheckAllowance]);

  // --- Handle Token Approval ---
  const handleApprove = async () => {
    if (!connectedAddress || !tokenAddress || !z.string().startsWith("0x").safeParse(tokenAddress).success) {
      setError("root", { type: "manual", message: "Valid Token Address is required for approval." });
      return;
    }

    setStatus('approving');
    setStatusMessage('Preparing approval transaction...');
    setSubmittedTxHash(null);
    setError("root", { message: "" });
    resetWriteContract();

    try {
      const approveArgs = prepareApproveErc20Args({
        tokenAddress: tokenAddress as Address,
        spenderAddress: ALLO_ADDRESS,
        amount: maxUint256,
      });

      setStatusMessage('Please confirm approval in your wallet...');
      writeContract(approveArgs, {
        onSuccess: (hash) => {
          setStatus('sending');
          setStatusMessage('Approving token... Tx sent. Waiting for confirmation...');
          console.log("Approval tx sent:", hash);
          setTimeout(handleCheckAllowance, 5000);
        },
        onError: (error) => {
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
    setStatusMessage(null);
    setError("root", { message: "" });
    setFinalRoundId(null);
    resetWriteContract();

    if (!connectedAddress || !chainId) {
      setError("root", { type: "manual", message: "Please connect your wallet and ensure network is selected." });
      return;
    }

    if (needsApproval && Number(data.matchingPool) > 0) {
      setError("root", { type: "manual", message: "Token approval required before creating the round." });
      return;
    }

    setStatus('sending');
    setStatusMessage('Preparing transaction...');
    setSubmittedTxHash(null);
    confirmedTxDataRef.current = null;

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
        protocol: 1n,
        pointer: metadataPointer,
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
        withdrawalCooldown: 0n,
        allowedTokens: [data.tokenAddress],
        isUsingAllocationMetadata: false,
      };
      const managers = [connectedAddress];

      // 2. Get transaction arguments
      const createPoolArgs = prepareCreatePoolArgs({
        profileId: data.profileId,
        strategyImplementationAddress: KICKSTARTER_QF_ADDRESS,
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
          setStatus('sending');
          setStatusMessage('Create round transaction sent. Waiting for confirmation...');
          setSubmittedTxHash(hash);
          confirmedTxDataRef.current = data;
          console.log("Create pool tx sent:", hash);
        },
        onError: (error) => {
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
  const isProcessing = ['approving', 'sending', 'confirming', 'saving'].includes(status);
  const isApproveButtonDisabled = isProcessing || isCheckingAllowance || !needsApproval;
  const isCreateButtonDisabled = isProcessing || isCheckingAllowance || (needsApproval && Number(matchingPool) > 0);

  // Determine icon for alert
  const getAlertIcon = () => {
    if (status === 'error' || !!errors.root) return <AlertTriangle className="h-4 w-4" />;
    if (status === 'success') return <CheckCircle className="h-4 w-4" />;
    if (status === 'saving') return <Database className="h-4 w-4 animate-pulse" />;
    if (isProcessing || status === 'approving') return <Loader2 className="h-4 w-4 animate-spin" />;
    return null;
  };

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
                          {/* {status === 'approving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Approve Max Token Spend */}
                          {(status === 'approving' || (status === 'sending' && submittedTxHash)) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {status === 'approving' ? 'Requesting Approval...' : (status === 'sending' && submittedTxHash) ? 'Waiting for Approval...' : 'Approve Max Token Spend'}
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

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                      <FormDescription>Link to the round&apos;s logo image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(statusMessage || errors.root?.message) && (
                  <Alert variant={status === 'error' || !!errors.root ? "destructive" : status === 'success' ? "default" : "default"} className={status === 'success' ? "border-green-500 text-green-700 dark:border-green-700 dark:text-green-400" : ""}>
                    {getAlertIcon()}
                    <AlertTitle>
                      {status === 'error' || !!errors.root ? "Error" : status === 'success' ? "Success" : "Status"}
                    </AlertTitle>
                    <AlertDescription>
                      {errors.root?.message || statusMessage}
                      {(status === 'sending' || status === 'confirming' || status === 'saving') && submittedTxHash && chain?.blockExplorers?.default.url && (
                        <>
                          <br />
                          View transaction: <a href={`${chain.blockExplorers.default.url}/tx/${submittedTxHash}`} target="_blank" rel="noopener noreferrer" className="underline">{submittedTxHash.substring(0,10)}...{submittedTxHash.substring(submittedTxHash.length - 8)}</a>
                          </>
                      )}
                            {status === 'success' && submittedTxHash && finalRoundId && chain?.blockExplorers?.default.url && (
                        <>
                          <br />
                          Transaction confirmed: <a href={`${chain.blockExplorers.default.url}/tx/${submittedTxHash}`} target="_blank" rel="noopener noreferrer" className="underline">{submittedTxHash.substring(0,10)}...{submittedTxHash.substring(submittedTxHash.length - 8)}</a>
                          <br />
                          <Button variant="link" className="p-0 h-auto mt-2 text-current" onClick={() => router.push(`/rounds/${finalRoundId}`)}>View Created Round</Button>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/rounds")}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreateButtonDisabled}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {status === 'success' ? 'Round Created' : status === 'saving' ? 'Saving...' : status === 'confirming' ? 'Confirming...' : status === 'sending' ? 'Processing...' : 'Create Round'}
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
