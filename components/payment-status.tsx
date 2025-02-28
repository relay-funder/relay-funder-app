'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function PaymentStatus() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()

    useEffect(() => {
        const clientSecret = searchParams.get('payment_intent_client_secret')
        const paymentIntentId = searchParams.get('payment_intent')
        const stripeKey = searchParams.get('stripe_key')

        if (!clientSecret || !paymentIntentId || !stripeKey) {
            setStatus('error')
            setMessage('Invalid payment session')
            return
        }

        const checkPaymentStatus = async () => {
            try {
                const stripe = await loadStripe(stripeKey)
                if (!stripe) throw new Error('Failed to load Stripe')

                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

                if (paymentIntent?.status === 'succeeded') {
                    setStatus('success')
                    setMessage('Thank you for your donation!')
                } else {
                    setStatus('error')
                    setMessage('Payment was not completed successfully')
                }
            } catch (err) {
                console.error('Error checking payment status:', err)
                setStatus('error')
                setMessage('Failed to verify payment status')
            }
        }

        checkPaymentStatus()
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
                {status === 'loading' ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4">Verifying payment status...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
                        <p className="text-gray-600">{message}</p>
                        <Link href="/" className="block">
                            <Button className="w-full">Return to Home</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-red-700">Payment Failed</h1>
                        <p className="text-gray-600">{message}</p>
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">Return to Home</Button>
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    )
} 