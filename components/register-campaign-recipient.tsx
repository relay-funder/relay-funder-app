"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useWriteContract, usePublicClient } from "wagmi"
import { simulateContract } from '@wagmi/core'
import { Hash, type Address } from "viem"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { prepareRegisterRecipientArgs } from "@/lib/qfInteractions"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/wagmi"

interface RegisterCampaignRecipientProps {
    campaignId: number
    campaignTitle: string
    campaignWalletAddress: Address
    poolId: bigint
    roundId: number
    disabled?: boolean
    buttonVariant?: "default" | "outline" | "secondary"
    buttonText?: string
    showDialog?: boolean
    onComplete?: () => void
}

export function RegisterCampaignRecipient({
    campaignId,
    campaignTitle,
    campaignWalletAddress,
    poolId,
    roundId,
    disabled = false,
    buttonVariant = "default",
    buttonText = "Register Campaign as Recipient",
    showDialog = true,
    onComplete,
}: RegisterCampaignRecipientProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const { writeContractAsync } = useWriteContract()
    const publicClient = usePublicClient()
    const router = useRouter()
    const { toast } = useToast()
    const { address: accountAddress, isConnected } = useAccount()

    async function handleRegisterRecipient() {
        if (!isConnected || !accountAddress) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to register.",
                variant: "destructive",
            })
            return
        }

        if (!campaignWalletAddress) {
            toast({
                title: "Campaign wallet address required",
                description: "Please set a wallet address for your campaign first.",
                variant: "destructive",
            })
            return
        }

        let hash: Hash | undefined = undefined

        try {
            setIsRegistering(true)

            const metadata = {
                protocol: BigInt(1),
                pointer: `ipfs://campaign/${campaignId}`,
            }

            console.log("--- Register Recipient Props ---");
            console.log("Pool ID:", poolId);
            console.log("Campaign ID:", campaignId);
            console.log("Recipient Address (campaignWalletAddress):", campaignWalletAddress);
            console.log("Recipient Payout Address (campaignWalletAddress):", campaignWalletAddress);
            console.log("Metadata:", metadata);
            console.log("Proposal Bid (Attempting 10):", BigInt(10));
            console.log("Connected Account:", accountAddress);
            console.log("---------------------------------");

            const args = prepareRegisterRecipientArgs({
                poolId,
                recipientAddress: campaignWalletAddress,
                recipientPayoutAddress: campaignWalletAddress,
                metadata,
                proposalBid: BigInt(10),
            })

            console.log("--- Prepared Args for Simulation ---");
            console.log("Args Object:", args);
            console.log("------------------------------------");

            console.log("Simulating registerRecipient transaction...");
            const { request } = await simulateContract(config, {
                address: args.address,
                abi: args.abi,
                functionName: args.functionName,
                args: args.args,
                account: accountAddress,
            });
            console.log("Simulation successful. Prepared request:", request);

            console.log("Executing writeContractAsync with simulated request...");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hash = await writeContractAsync({...request, type: undefined} as any);
            console.log("Transaction Hash:", hash);

            if (hash) {
                toast({
                    title: "Registration submitted",
                    description: "Your registration is being processed on-chain.",
                })

                const receipt = await publicClient.waitForTransactionReceipt({ hash })

                if (receipt.status === "success") {
                    const onchainRecipientId = campaignWalletAddress

                    const response = await fetch('/api/rounds/recipients/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            campaignId,
                            roundId,
                            recipientAddress: campaignWalletAddress,
                            onchainRecipientId,
                            walletAddress: accountAddress,
                        }),
                    })

                    const data = await response.json()

                    if (data.success) {
                        toast({
                            title: "Registration successful",
                            description: "Your campaign has been registered as a recipient.",
                        })
                        
                        if (onComplete) {
                            onComplete()
                        } else {
                            router.refresh()
                        }
                    } else {
                        toast({
                            title: "Database update failed",
                            description: data.error || "Failed to update application status in database.",
                            variant: "destructive",
                        })
                    }
                } else {
                    toast({
                        title: "Transaction Failed On-Chain",
                        description: `Transaction reverted. Hash: ${hash}`,
                        variant: "destructive",
                    })
                }
            }
        } catch (error) {
            console.error("Transaction failed during simulation or execution:", error);
            console.error("Full Error Object:", error);

            toast({
                title: "Registration Failed",
                description: "Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsRegistering(false)
            if (showDialog && !hash) {
            } else if (showDialog && hash) {
                setIsOpen(false);
            }
        }
    }

    if (!showDialog) {
        return (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Register Campaign for Quadratic Funding</h4>
                    <p className="text-sm text-muted-foreground">
                        You&apos;ll need to register your campaign &quot;{campaignTitle}&quot; as a recipient on the blockchain to participate in this quadratic funding round.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium">Campaign Payout Address</h4>
                    <p className="text-sm text-muted-foreground break-all">
                        {campaignWalletAddress}
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium">Important Notice</h4>
                    <p className="text-sm text-muted-foreground">
                        By registering, you agree to the terms and conditions of the round.
                        Your application will need to be reviewed by the round administrators.
                    </p>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={onComplete}>
                        Cancel
                    </Button>
                    <Button onClick={handleRegisterRecipient} disabled={isRegistering}>
                        {isRegistering ? "Registering..." : "Register Campaign"}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={buttonVariant} disabled={disabled}>
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register as Round Recipient</DialogTitle>
                    <DialogDescription>
                        Register your campaign &quot;{campaignTitle}&quot; as a recipient in this funding round.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Campaign Payout Address</h4>
                        <p className="text-sm text-muted-foreground break-all">
                            {campaignWalletAddress}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium">Important Notice</h4>
                        <p className="text-sm text-muted-foreground">
                            By registering, you agree to the terms and conditions of the round.
                            Your application will need to be reviewed by the round administrators.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleRegisterRecipient} disabled={isRegistering}>
                        {isRegistering ? "Registering..." : "Register Campaign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 