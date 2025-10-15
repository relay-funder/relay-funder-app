import { Card, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/contexts';
import { Users } from 'lucide-react';
import Image from 'next/image';
export function DashboardNotAuthenticated() {
  const { login } = useAuth();
  return (
    <Card className="border-2 border-dashed border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20">
          <Users className="h-8 w-8 text-quantum" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">
          Login to your account
        </h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          Please connect your wallet to view your campaign dashboard and manage
          your fundraising activities.
        </p>
        <Button
          variant="outline"
          className="bg-accent/50 font-semibold text-accent-foreground hover:bg-accent/70"
          onClick={login}
        >
          Connect Wallet
          <Image src="/wallet-icon.png" alt="wallet" width={14} height={14} />
        </Button>
      </CardContent>
    </Card>
  );
}
