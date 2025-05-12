import { Button } from '@/components/ui';
import Image from 'next/image';
import { useAuth } from '@/contexts';
export function CollectionListEmptyNoAuth() {
  const { login } = useAuth();
  return (
    <div className="rounded-lg bg-gray-50 p-8 text-center">
      <Image
        src="/sparkles.png"
        alt="Collections"
        width={64}
        height={64}
        className="mx-auto mb-4"
      />
      <h2 className="mb-2 text-xl font-semibold">
        Sign in to create collections
      </h2>
      <p className="mb-4 text-gray-600">
        You need to sign in to create and manage your own collections.
      </p>
      <Button className="bg-purple-600 hover:bg-purple-700" onClick={login}>
        Sign In
      </Button>
    </div>
  );
}
