'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, FileText, Clock, Edit } from 'lucide-react';
import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormattedDate } from '@/components/formatted-date';
import { UserInlineName } from '@/components/user/inline-name';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { NotificationData } from '@/lib/notification/types';

export type EventFeedUser = {
  id?: number;
  address?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type EventFeedListItemData = {
  createdAt: string;
  type: string;
  message: string;
  data?: NotificationData;
  link?: string;
  linkLabel?: string;
  createdBy?: EventFeedUser | null;
  receiver?: EventFeedUser | null;
};

export type EventFeedTypeConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
};

export const EVENT_FEED_TYPE_CONFIG: Record<string, EventFeedTypeConfig> = {
  CampaignApprove: {
    label: 'Campaign Approved',
    icon: Edit,
    badgeVariant: 'default',
  },
  CampaignDisable: {
    label: 'Campaign Ended',
    icon: Edit,
    badgeVariant: 'destructive',
  },
  CampaignComment: {
    label: 'New Comment',
    icon: MessageSquare,
    badgeVariant: 'secondary',
  },
  CampaignPayment: {
    label: 'New Donation',
    icon: Clock,
    badgeVariant: 'default',
  },
  CampaignUpdate: {
    label: 'Campaign Update',
    icon: FileText,
    badgeVariant: 'secondary',
  },
};

function fallbackTypeConfig(type: string): EventFeedTypeConfig {
  return {
    label: type.replace(/([a-z])([A-Z])/g, '$1 $2'),
    icon: Bell,
    badgeVariant: 'outline',
  };
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

type ResolvedActionLink = {
  href: string;
  label: string;
};

const ID_LINK_RESOLVERS: Array<{
  key: string;
  resolve: (
    value: unknown,
    payload: Record<string, unknown>,
  ) => ResolvedActionLink | null;
}> = [
  {
    key: 'campaignId',
    resolve: (value, payload) => {
      if (typeof value !== 'number') {
        return null;
      }
      const campaignTitle =
        typeof payload.campaignTitle === 'string'
          ? payload.campaignTitle
          : undefined;
      return {
        href: `/campaigns/${value}`,
        label: campaignTitle
          ? `View campaign: ${campaignTitle}`
          : 'View campaign',
      };
    },
  },
  {
    key: 'roundId',
    resolve: (value, payload) => {
      if (typeof value !== 'number') {
        return null;
      }
      const roundTitle =
        typeof payload.roundTitle === 'string' ? payload.roundTitle : undefined;
      return {
        href: `/rounds/${value}`,
        label: roundTitle ? `View round: ${roundTitle}` : 'View round',
      };
    },
  },
];

type InlineUser = {
  name?: string | null;
  address?: string | null;
  isVouched?: boolean;
};

function toInlineUser(
  user: EventFeedUser | null | undefined,
): InlineUser | undefined {
  if (!user) return undefined;

  const nameParts = [user.firstName, user.lastName].filter(
    (part): part is string =>
      typeof part === 'string' && part.trim().length > 0,
  );
  const fullName = nameParts.join(' ');
  const username =
    typeof user.username === 'string' && user.username.trim().length
      ? user.username
      : undefined;
  const address =
    typeof user.address === 'string' && user.address.trim().length
      ? user.address
      : undefined;

  return {
    name: fullName || username || address || null,
    address: address ?? null,
  };
}

function getNavigationUrl(event: EventFeedListItemData): string | null {
  if (!event.data || typeof event.data !== 'object') {
    return null;
  }

  const payload = event.data as Record<string, unknown>;

  // For campaign-related events, navigate to campaign
  // The notification data contains campaignId, but campaigns are accessed by slug
  // We'll need to construct a URL that can handle campaignId lookup
  if (event.type.startsWith('Campaign') && typeof payload.campaignId === 'number') {
    // Use campaignId for now - the campaign page should handle ID-based lookup
    return `/campaigns/${payload.campaignId}`;
  }

  // For user-related events, navigate to user profile (admin only)
  if (event.createdBy?.address) {
    return `/admin/users/${event.createdBy.address}`;
  }

  return null;
}

export type EventFeedListItemProps = {
  event: EventFeedListItemData;
  className?: string;
  onSelect?: (event: EventFeedListItemData) => void;
  showReceiver?: boolean;
};

export function EventFeedListItem({
  event,
  className,
  onSelect,
  showReceiver: showReceiverOverride,
}: EventFeedListItemProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: user } = useUserProfile();
  const showReceiver = showReceiverOverride ?? Boolean(isAdmin);
  const isUnread = useMemo(() => {
    if (!user?.eventFeedRead) return true;
    return new Date(event.createdAt) > new Date(user.eventFeedRead);
  }, [event.createdAt, user?.eventFeedRead]);
  const config = useMemo<EventFeedTypeConfig>(() => {
    return EVENT_FEED_TYPE_CONFIG[event.type] ?? fallbackTypeConfig(event.type);
  }, [event.type]);
  const Icon = config.icon;
  const actionLinks = useMemo<ResolvedActionLink[]>(() => {
    const resolved: ResolvedActionLink[] = [];
    const appendLink = (href?: string, label?: string) => {
      if (!href) {
        return;
      }
      const value =
        typeof label === 'string' && label.trim().length > 0
          ? label
          : 'View details';
      resolved.push({ href, label: value });
    };

    if (event.link) {
      appendLink(event.link, event.linkLabel);
    }

    if (event.data && typeof event.data === 'object') {
      const payload = event.data as Record<string, unknown>;
      const payloadLink =
        typeof payload.link === 'string'
          ? payload.link
          : typeof payload.url === 'string'
            ? payload.url
            : undefined;

      const payloadLabel =
        typeof payload.linkLabel === 'string'
          ? payload.linkLabel
          : typeof payload.label === 'string'
            ? payload.label
            : undefined;

      appendLink(payloadLink, payloadLabel);

      ID_LINK_RESOLVERS.forEach(({ key, resolve }) => {
        const value = payload[key];
        const resolvedLink = resolve(value, payload);
        if (resolvedLink) {
          appendLink(resolvedLink.href, resolvedLink.label);
        }
      });
    }

    const unique = new Map<string, ResolvedActionLink>();
    resolved.forEach((link) => {
      if (!unique.has(link.href)) {
        unique.set(link.href, link);
      }
    });

    return Array.from(unique.values());
  }, [event]);
  const creatorUser = useMemo(
    () => toInlineUser(event.createdBy),
    [event.createdBy],
  );
  const receiverUser = useMemo(
    () => toInlineUser(event.receiver),
    [event.receiver],
  );
  const navigationUrl = useMemo(() => getNavigationUrl(event), [event]);
  
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(event);
      return;
    }
    
    // Navigate to the relevant page if we have a URL
    if (navigationUrl) {
      router.push(navigationUrl);
    }
  }, [event, onSelect, navigationUrl, router]);

  const isClickable = Boolean(onSelect || navigationUrl);

  return (
    <Card
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        'border border-border bg-card px-4 py-3 transition-shadow hover:shadow-sm',
        isClickable &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isUnread && 'bg-muted/20',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant={config.badgeVariant ?? 'outline'} className="shrink-0">
            {config.label}
          </Badge>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          <FormattedDate
            date={new Date(event.createdAt)}
            options={DATE_FORMAT_OPTIONS}
          />
        </span>
      </div>
      
      <p className="mt-2 text-sm leading-relaxed text-foreground">{event.message}</p>

      {isAdmin && event.data && (
        <>
          {event.type === 'CampaignComment' &&
            'comment' in event.data &&
            event.data.comment && (
              <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Comment:</strong> {event.data.comment}
                </p>
              </div>
            )}
          {event.type === 'CampaignUpdate' &&
            'updateText' in event.data &&
            event.data.updateText && (
              <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Update:</strong> {event.data.updateText}
                </p>
              </div>
            )}
        </>
      )}

      {(creatorUser || (showReceiver && receiverUser)) && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {creatorUser ? (
            <UserInlineName user={creatorUser} prefix="Creator:" />
          ) : null}

          {showReceiver && receiverUser ? (
            <UserInlineName user={receiverUser} prefix="Receiver:" />
          ) : null}
        </div>
      )}
    </Card>
  );
}
