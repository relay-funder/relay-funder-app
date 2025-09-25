import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@/components/ui';
import Link from 'next/link';
import { Wallet, Bell } from 'lucide-react';

export function ProfileAdditionalSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Settings</CardTitle>
        <CardDescription>
          Configure your payment methods, manage wallet addresses, and review
          your event feed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/profile/wallet">
            <Button variant="outline" className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet Settings
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
