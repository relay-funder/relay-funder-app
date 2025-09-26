import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@/components/ui';
import Link from 'next/link';
import { Wallet, Settings } from 'lucide-react';

export function ProfileAdditionalSettings() {
  return (
    <Card className="rounded-lg border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Additional Settings
        </CardTitle>
        <CardDescription>
          Configure your wallet settings and manage payment preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/profile/wallet" className="block">
            <Button
              variant="outline"
              className="h-auto w-full justify-start p-4"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Wallet Settings</div>
                  <div className="text-xs text-muted-foreground">
                    Manage connected wallets
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
