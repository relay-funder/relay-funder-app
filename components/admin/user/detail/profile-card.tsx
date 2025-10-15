'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from '@/components/ui';
import type { GetUserResponseInstance } from '@/lib/api/types';

export interface ProfileCardProps {
  user: GetUserResponseInstance;
  totalComments: number;
  totalFavorites: number;
  totalRoundContributions: number;
}

function safe(value?: string | null, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s.length ? s : fallback;
}

/**
 * Admin User Profile Card
 * - Displays core profile fields
 * - Status and counts badges
 * - Roles and feature flags
 */
export function ProfileCard({
  user,
  totalComments,
  totalFavorites,
  totalRoundContributions,
}: ProfileCardProps) {
  const counts = user._count || {};

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Username</div>
            <div className="text-base">{safe(user.username)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="text-base">{safe(user.email)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">First name</div>
            <div className="text-base">{safe(user.firstName)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Last name</div>
            <div className="text-base">{safe(user.lastName)}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Bio</div>
            <div className="text-base">{safe(user.bio)}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">
              Recipient wallet
            </div>
            <div className="break-all text-base">
              {safe(user.recipientWallet)}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Payments: {counts.payments ?? 0}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Payment methods: {counts.paymentMethods ?? 0}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Media: {counts.createdMedia ?? 0}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Withdrawals created: {counts.withdrawals ?? 0}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Approvals: {counts.approvals ?? 0}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Comments: {totalComments}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Favorites: {totalFavorites}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Round contributions: {totalRoundContributions}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium">Roles</div>
            <div className="flex flex-wrap gap-2">
              {(user.roles || []).length > 0 ? (
                user.roles.map((r) => (
                  <Badge
                    key={r}
                    variant="outline"
                    className="border-slate-300 text-slate-700"
                  >
                    {r}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Feature Flags</div>
            <div className="flex flex-wrap gap-2">
              {(user.featureFlags || []).length > 0 ? (
                user.featureFlags.map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    className="border-slate-300 text-slate-700"
                  >
                    {f}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
