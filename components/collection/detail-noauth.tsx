import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
export function CollectionDetailNoAuth() {
  const router = useRouter();
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="mb-4 text-3xl font-bold">Sign in to view collections</h1>
      <p className="mb-6">You need to sign in to view this collection.</p>
      <Button onClick={() => router.push('/collections')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Collections
      </Button>
    </div>
  );
}
