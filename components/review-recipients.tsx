"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWriteContract, useReadContract, usePublicClient, useAccount } from "wagmi"
import { type Address } from "viem"

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { prepareReviewRecipientsArgs, ApplicationStatus } from "@/lib/qfInteractions"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface Recipient {
    id: number
    address: Address
    campaignId: number
    campaignName: string
    currentStatus: ApplicationStatus
}

interface ReviewRecipientsProps {
    strategyAddress: Address
    poolId: bigint
    roundId: number
    recipients: Recipient[]
    isAdmin: boolean
}

export function ReviewRecipients({
    strategyAddress,
    poolId,
    roundId,
    recipients,
    isAdmin,
}: ReviewRecipientsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isReviewing, setIsReviewing] = useState(false)
    const [selectedRecipients, setSelectedRecipients] = useState<Record<string, ApplicationStatus>>({})
    const { writeContractAsync } = useWriteContract()
    const publicClient = usePublicClient()
    const router = useRouter()
    const { toast } = useToast()
    const { address } = useAccount()
    console.log("recipients", recipients, "poolId", poolId, "roundId", roundId, "strategyAddress", strategyAddress)

    // Read the current recipients counter from the contract
    const { data: recipientsCounter } = useReadContract({
        address: strategyAddress,
        abi: [
            {
                inputs: [],
                name: "recipientsCounter",
                outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
                stateMutability: "view",
                type: "function",
            },
        ],
        functionName: "recipientsCounter",
    })

    // Toggle recipient selection and status
    function toggleRecipientStatus(recipientAddress: Address, status: ApplicationStatus) {
        setSelectedRecipients(prev => {
            const newSelected = { ...prev }

            // If already selected with this status, remove selection
            if (newSelected[recipientAddress] === status) {
                delete newSelected[recipientAddress]
            } else {
                // Otherwise set to the new status
                newSelected[recipientAddress] = status
            }

            return newSelected
        })
    }

    async function handleReviewRecipients() {
        if (Object.keys(selectedRecipients).length === 0) {
            toast({
                title: "No recipients selected",
                description: "Please select at least one recipient to review.",
                variant: "destructive",
            })
            return
        }

        if (!recipientsCounter) {
            toast({
                title: "Unable to fetch recipients counter",
                description: "Please try again later.",
                variant: "destructive",
            })
            return
        }

        try {
            setIsReviewing(true)

            // Convert the selection map to arrays for the contract
            const recipientIds: Address[] = []
            const newStatuses: ApplicationStatus[] = []

            Object.entries(selectedRecipients).forEach(([address, status]) => {
                recipientIds.push(address as Address)
                newStatuses.push(status)
            })

            // Prepare transaction arguments
            const args = prepareReviewRecipientsArgs({
                strategyAddress,
                recipientIds,
                newStatuses,
                recipientsCounter: recipientsCounter as bigint,
            })

            // Execute the transaction
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hash = await writeContractAsync({...args, type: undefined} as any)
            
            // Wait for transaction confirmation
            if (hash) {
                toast({
                    title: "Review submitted",
                    description: "Your review is being processed on-chain.",
                })
                
                const receipt = await publicClient.waitForTransactionReceipt({ hash })
                
                if (receipt.status === "success") {
                    // Update database via API
                    const response = await fetch('/api/rounds/recipients/review', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            roundId,
                            updates: recipientIds.map((addr, i) => ({ 
                                address: addr, 
                                status: newStatuses[i] 
                            })),
                            managerAddress: address as Address, // From useAccount()  
                        }),
                    })
                    
                    const data = await response.json()
                    
                    if (data.success) {
                        toast({
                            title: "Review successful",
                            description: "The recipient statuses have been updated.",
                        })
                        router.refresh()
                    } else {
                        toast({
                            title: "Database update failed",
                            description: data.error || "Failed to update application statuses in database.",
                            variant: "destructive",
                        })
                    }
                }
            }
        } catch (error) {
            console.error("Failed to review recipients:", error)
            toast({
                title: "Review failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            })
        } finally {
            setIsReviewing(false)
            setIsOpen(false)
            setSelectedRecipients({})
        }
    }

    if (!isAdmin || recipients.length === 0) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Review Recipients</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Review Round Recipients</DialogTitle>
                    <DialogDescription>
                        Approve or reject recipient applications for this funding round.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Current Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recipients.map((recipient) => (
                                <TableRow key={recipient.id}>
                                    <TableCell className="font-medium">{recipient.campaignName}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={recipient.currentStatus} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                size="sm"
                                                variant={selectedRecipients[recipient.address] === ApplicationStatus.Accepted ? "default" : "outline"}
                                                onClick={() => toggleRecipientStatus(recipient.address, ApplicationStatus.Accepted)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={selectedRecipients[recipient.address] === ApplicationStatus.Rejected ? "destructive" : "outline"}
                                                onClick={() => toggleRecipientStatus(recipient.address, ApplicationStatus.Rejected)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReviewRecipients}
                        disabled={isReviewing || Object.keys(selectedRecipients).length === 0}
                    >
                        {isReviewing ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper component to display status badges
function StatusBadge({ status }: { status: ApplicationStatus }) {
    switch (status) {
        case ApplicationStatus.None:
            return <Badge variant="outline">None</Badge>
        case ApplicationStatus.Pending:
            return <Badge variant="secondary">Pending</Badge>
        case ApplicationStatus.Accepted:
            return <Badge variant="success">Approved</Badge>
        case ApplicationStatus.Rejected:
            return <Badge variant="destructive">Rejected</Badge>
        case ApplicationStatus.Appealed:
            return <Badge variant="warning">Appealed</Badge>
        default:
            return <Badge variant="outline">Unknown</Badge>
    }
} 