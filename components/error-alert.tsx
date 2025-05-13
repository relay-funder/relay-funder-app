import { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui';
import { Info } from 'lucide-react';
export function ErrorAlert({
  error,
}: {
  error: Error | string | null | undefined;
}) {
  const errorMessage = useMemo(() => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An error occurred';
  }, [error]);
  if (!error) {
    return null;
  }
  return (
    <Alert variant="default" className="border-indigo-100 bg-indigo-50">
      <Info className="h-4 w-4 text-indigo-600" />
      <AlertDescription className="overflow-x-auto text-indigo-600">
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
}
