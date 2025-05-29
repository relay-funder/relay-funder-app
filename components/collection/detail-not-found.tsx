import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function CollectionDetailNotFound() {
  const router = useRouter();
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="mb-4 text-3xl font-bold">Collection not found</h1>
      <p className="mb-6">
        The collection you&apos;re looking for doesn&apos;t exist or you
        don&apos;t have access to it.
      </p>
      <Button onClick={() => router.push('/collections')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Collections
      </Button>
    </div>
  );
}
