'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, FileText, Clock, Edit } from 'lucide-react';
import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormattedDate } from '@/components/formatted-date';
import { UserInlineName } from '@/components/user/inline-name';
import { useUserProfile } from '@/lib/hooks/useProfile';

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
  data?: unknown;
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
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(event);
    }
  }, [event, onSelect]);

  return (
    <Card
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleClick : undefined}
      className={cn(
        'flex items-start gap-4 border border-border/60 bg-card px-4 py-5 transition-shadow hover:shadow-md',
        onSelect &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isUnread &&
          'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        className,
      )}
    >
      <div className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
        {isUnread && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={config.badgeVariant ?? 'outline'}>
            {config.label}
          </Badge>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <FormattedDate
              date={new Date(event.createdAt)}
              options={DATE_FORMAT_OPTIONS}
            />
          </span>
        </div>
        <p className="text-sm leading-6 text-foreground">{event.message}</p>

        {actionLinks.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actionLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="link"
                className="h-auto p-0 text-sm font-semibold text-primary"
              >
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          {creatorUser ? (
            <UserInlineName user={creatorUser} prefix="Creator:" />
          ) : null}

          {showReceiver && receiverUser ? (
            <UserInlineName user={receiverUser} prefix="Receiver:" />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
