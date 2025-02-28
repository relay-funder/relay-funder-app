import { Suspense } from 'react'
import PaymentStatus from '@/components/payment-status'

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading payment status...</p>
          </div>
        </div>
      }
    >
      <PaymentStatus />
    </Suspense>
  )
} 