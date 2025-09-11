import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';
import {
  Card,
  Avatar,
  AvatarFallback,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { UserRound, Pencil, LogOut } from 'lucide-react';
import { FormattedDate } from '@/components/formatted-date';
import { useAuth } from '@/contexts';
export function ProfileCard({
  profile,
  onEdit,
}: {
  profile?: Profile;
  onEdit?: () => void;
}) {
  const { address, logout, isAdmin } = useAuth();
  const router = useRouter();
  const onLogout = useCallback(async () => {
    await logout();
    router.push('/');
  }, [logout, router]);
  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <Avatar className="h-24 w-24">
            <AvatarFallback>
              <UserRound className="h-20 w-20 rounded-full bg-green-100 p-4" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile?.firstName || 'Anonymous User'}
                {profile?.lastName && ` ${profile?.lastName}`}
              </h2>
              {isAdmin && (
                <Badge variant="success" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <p className="break-all text-sm text-muted-foreground">
              Wallet: {address}
            </p>
            <p className="text-sm text-muted-foreground">
              Last login:{' '}
              {profile?.updatedAt ? (
                <FormattedDate date={profile.updatedAt} />
              ) : (
                'Never logged in'
              )}
            </p>
          </div>
        </div>
      </CardContent>
      <div className="absolute right-4 top-4 flex space-x-2">
        <Button variant="ghost" title="Edit" onClick={onEdit}>
          <Pencil />
        </Button>
        <Button variant="ghost" title="Sign Out" onClick={onLogout}>
          <LogOut />
        </Button>
      </div>
    </Card>
  );
}
