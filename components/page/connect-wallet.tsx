import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui';
import Image from 'next/image';

export function PageConnectWallet({ children }: { children: ReactNode }) {
  const { login } = useAuth();
  return (
    <div className="flex w-full flex-col bg-background">
      <main
        className={cn(
          'container mx-auto flex h-[calc(100vh-200px)]',
          'max-w-7xl items-center justify-center',
          'px-2 py-8 md:px-4',
        )}
      >
        <div className="flex justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Connect Your Wallet
            </h2>
            <p className="mb-6 text-muted-foreground">{children}</p>
            <Button
              variant="outline"
              className="bg-accent/50 font-semibold text-accent-foreground hover:bg-accent"
              onClick={login}
            >
              Connect Wallet
              <Image
                src="/wallet-icon.png"
                alt="wallet"
                width={14}
                height={14}
              />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
