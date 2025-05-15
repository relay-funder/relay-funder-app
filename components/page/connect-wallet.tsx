import { ReactNode } from 'react';

export function PageConnectWallet({ children }: { children: ReactNode }) {
  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Connect Your Wallet</h2>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
