import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@/components/ui';
import Link from 'next/link';
import { Wallet, Bell, Settings } from 'lucide-react';

export function ProfileAdditionalSettings() {
  return (
    <Card className="rounded-lg border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Additional Settings
        </CardTitle>
        <CardDescription>
          Configure your wallet settings, manage payment preferences, and review
          your event feed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Wallet Settings Section */}
          <div>
            <Link href="/profile/wallet" className="block">
              <Button
                variant="outline"
                className="h-auto w-full justify-start p-4 hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-foreground">
                      Wallet Settings
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Manage connected wallets and network settings
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Inbox Section */}
          <div>
            <Link href="/profile/inbox" className="block">
              <Button
                variant="outline"
                className="h-auto w-full justify-start p-4 hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-foreground">Inbox</div>
                    <div className="text-xs text-muted-foreground">
                      Check your event feed and notifications
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
