"use client"

import { useState, useEffect } from "react"
import { useWallets } from '@privy-io/react-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react"

interface KycVerificationFormProps {
    customerId: string
    isCompleted: boolean
    onSuccess: () => void
}

export function KycVerificationForm({ customerId, isCompleted, onSuccess }: KycVerificationFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [kycUrl, setKycUrl] = useState<string | null>(null)
    const [kycStatus, setKycStatus] = useState<string>(isCompleted ? "completed" : "not_started")
    const { wallets } = useWallets()
    const wallet = wallets[0]
    console.log("wallet", wallet)

    // Check KYC status when component mounts
    useEffect(() => {
        if (isCompleted) return

        const checkKycStatus = async () => {
            if (!customerId) return

            try {
                setIsLoading(true)
                const response = await fetch(`/api/bridge/kyc/status?customerId=${customerId}`)
                const data = await response.json()

                if (response.ok && data.status) {
                    setKycStatus(data.status)
                    if (data.status === "completed") {
                        onSuccess()
                    }
                }
            } catch (error) {
                console.error("Error checking KYC status:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkKycStatus()
        // Set up polling to check status periodically
        const interval = setInterval(checkKycStatus, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [customerId, isCompleted, onSuccess])

    const initiateKyc = async () => {
        if (!customerId) {
            toast({
                title: "Error",
                description: "Customer ID is required to initiate KYC",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch('/api/bridge/kyc/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate KYC')
            }

            if (data.redirectUrl) {
                setKycUrl(data.redirectUrl)
                setKycStatus("pending")
            }
        } catch (error) {
            console.error("Error initiating KYC:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to initiate KYC verification",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const renderKycStatus = () => {
        switch (kycStatus) {
            case "completed":
                return (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-600">KYC Verification Complete</AlertTitle>
                        <AlertDescription className="text-green-600">
                            Your identity has been verified successfully. You can now add payment methods.
                        </AlertDescription>
                    </Alert>
                )
            case "pending":
                return (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-600">KYC Verification In Progress</AlertTitle>
                        <AlertDescription className="text-yellow-600">
                            {kycUrl ? (
                                <>
                                    <p className="mb-4">Please complete your KYC verification process by clicking the button below.</p>
                                    <Button variant="outline" className="bg-white" onClick={() => window.open(kycUrl, "_blank")}>
                                        Complete KYC Verification <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                "Your KYC verification is being processed. This may take some time."
                            )}
                        </AlertDescription>
                    </Alert>
                )
            case "failed":
                return (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>KYC Verification Failed</AlertTitle>
                        <AlertDescription>
                            Your identity verification failed. Please try again.
                            <Button
                                variant="outline"
                                className="mt-4 bg-white text-destructive border-destructive"
                                onClick={initiateKyc}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : "Retry KYC Verification"}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )
            default:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            To verify your identity, you will need to complete a KYC (Know Your Customer) process.
                            This helps us comply with regulations and ensure the security of transactions.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You will need to provide identification documents such as a passport, driver&apos;s license, or national ID card.
                        </p>
                        <Button
                            onClick={initiateKyc}
                            disabled={isLoading || !customerId}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Initiating KYC...
                                </>
                            ) : "Start KYC Verification"}
                        </Button>
                    </div>
                )
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>
                    Verify your identity to enable bank transfers and other payment methods.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderKycStatus()}
            </CardContent>
        </Card>
    )
} 