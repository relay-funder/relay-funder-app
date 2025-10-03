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
import { UserRound, Pencil, LogOut, Mail, User, Clock } from 'lucide-react';
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
    <Card className="rounded-lg border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-muted">
                <UserRound className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground">
                    {profile?.firstName || 'Anonymous User'}
                    {profile?.lastName && ` ${profile?.lastName}`}
                  </h1>
                  {isAdmin && (
                    <Badge variant="success" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                {profile?.username && (
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="break-all">{address}</span>
                </div>

                {profile?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last login:{' '}
                    {profile?.updatedAt ? (
                      <FormattedDate date={profile.updatedAt} />
                    ) : (
                      'Never logged in'
                    )}
                  </span>
                </div>
              </div>

              {profile?.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="rounded-full"
              aria-label="Edit profile"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-full"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
