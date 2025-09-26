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
    <Card className="rounded-lg border bg-white shadow-sm">
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
        <div className="space-y-4">
          <Link href="/profile/wallet" className="block">
            <Button
              variant="outline"
              className="h-auto w-full justify-start p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    Wallet Settings
                  </div>
                  <div className="text-xs text-gray-600">
                    Manage connected wallets and network settings
                  </div>
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/profile/inbox">
            <Button variant="outline" className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Inbox
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
