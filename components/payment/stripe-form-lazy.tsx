import { Suspense, lazy, Component, ReactNode, ErrorInfo } from 'react';
import { type Campaign } from '@/types/campaign';
import { type Stripe } from '@stripe/stripe-js';

// Lazy load the Stripe Elements components to reduce initial bundle size
const LazyElements = lazy(() =>
  import('@stripe/react-stripe-js').then((module) => ({
    default: module.Elements,
  })),
);

const LazyPaymentStripeForm = lazy(() =>
  import('./stripe-form').then((module) => ({
    default: module.PaymentStripeForm,
  })),
);

// Enhanced loading skeleton for Stripe form
function StripeFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/3 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="mt-4 h-10 rounded bg-gray-300"></div>
    </div>
  );
}

// Error fallback component for payment form failures
function PaymentErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-red-800">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="font-medium">Payment form error</h3>
      </div>
      <p className="mb-3 text-sm text-red-700">
        Failed to load the payment form. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

// Simple error boundary class component
class PaymentErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment form error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PaymentErrorFallback
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry();
          }}
        />
      );
    }

    return this.props.children;
  }
}

interface LazyStripeFormProps {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  publicKey: string;
  campaign: Campaign;
  userAddress: string | null;
  amount: string;
}

export function LazyStripeForm({
  stripePromise,
  clientSecret,
  publicKey,
  campaign,
  userAddress,
  amount,
}: LazyStripeFormProps) {
  const handleRetry = () => {
    // Force re-render by re-creating the component
    window.location.reload();
  };

  return (
    <PaymentErrorBoundary onRetry={handleRetry}>
      <Suspense fallback={<StripeFormSkeleton />}>
        <LazyElements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <LazyPaymentStripeForm
            publicKey={publicKey}
            campaign={campaign}
            userAddress={userAddress}
            amount={amount}
          />
        </LazyElements>
      </Suspense>
    </PaymentErrorBoundary>
  );
}
