'use client';

import type { MouseEventHandler, ReactNode, KeyboardEventHandler } from 'react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  getDisplayName,
  getTotalAssets,
  sliceRoles,
  shorten,
  safeString,
} from './types';
import { GetUserResponseInstance } from '@/lib/api/types';

export type UserCardProps = {
  user: GetUserResponseInstance;
  className?: string;
  maxVisibleRoles?: number;
  footer?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

/**
 * Compact, reusable card for displaying an admin user summary.
 *
 * - Shows display name, shortened address
 * - KYC status
 * - Up to N roles with overflow count
 * - Email + recipient wallet
 * - Basic counts: Payments, Approvals, Assets
 *
 * Extend with "footer" to add custom actions or metadata below the default content.
 */
export function UserCard({
  user,
  className,
  maxVisibleRoles = 2,
  footer,
  onClick,
}: UserCardProps) {
  const displayName = getDisplayName(user);
  const counts = user._count || {};
  const totalAssets = getTotalAssets(counts);
  const { visible: visibleRoles, overflow } = sliceRoles(
    user.roles,
    maxVisibleRoles,
  );

  const clickable = typeof onClick === 'function';

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex flex-col gap-3 p-4',
        clickable && 'cursor-pointer transition-shadow hover:shadow-sm',
        className,
      )}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{displayName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {shorten(user.address)}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-1">
          {visibleRoles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className="border-border text-muted-foreground"
              title={role}
            >
              {role}
            </Badge>
          ))}

          {overflow > 0 && (
            <Badge
              variant="outline"
              className="border-border text-muted-foreground"
            >
              +{overflow}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="truncate">
          Email:{' '}
          <span
            className={cn(
              'text-foreground',
              !user.email && 'italic opacity-70',
            )}
            title={user.email ?? undefined}
          >
            {safeString(user.email)}
          </span>
        </div>

        <div className="truncate">
          Wallet:{' '}
          <span
            className={cn(
              'text-foreground',
              !user.recipientWallet && 'italic opacity-70',
            )}
            title={user.recipientWallet ?? undefined}
          >
            {safeString(user.recipientWallet)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Payments: {counts.payments ?? 0}
        </Badge>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Approvals: {counts.approvals ?? 0}
        </Badge>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Assets: {totalAssets}
        </Badge>
      </div>

      {footer ? <div className="pt-1">{footer}</div> : null}
    </Card>
  );
}

export default UserCard;
