'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, MessageCircleQuestion } from 'lucide-react';
import * as ReactShare from 'react-share';

import { toast } from '@/hooks/use-toast';
import { DbCampaign } from '@/types/campaign';
import { Collection } from '@/types';
import { cn } from '@/lib/utils';
import { Textarea } from './ui';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';

interface ShareDialogProps {
  campaign?: DbCampaign;
  collection?: Collection;
  pageUrl?: string;
  children?: React.ReactNode;
  networks?: { name: string; color?: string }[];
}
const defaultNetworks = [
  {
    name: 'Twitter',
    color: 'bg-[#00aced]',
  },
  {
    name: 'Bluesky',
    color: 'bg-[#1185FE]',
  },
  {
    name: 'Facebook',
    color: 'bg-[#0965fe]',
  },
  {
    name: 'Linkedin',
    color: 'bg-[#0077B5]',
  },
  {
    name: 'Whatsapp',
    color: 'bg-[#25D366]',
  },
  {
    name: 'Threads',
    color: 'bg-[#000000]',
  },
  {
    name: 'Reddit',
    color: 'bg-[#FF5700]',
  },
  {
    name: 'Email',
    color: 'bg-[#7f7f7f]',
  },
];
export function ShareDialog({
  campaign,
  collection,
  pageUrl,
  children,
  networks = defaultNetworks,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPromoteHints, setShowPromoteHints] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const { amountGoal } = useCampaignStatsFromInstance({
    campaign,
  });
  const toggleCustom = useCallback(() => {
    setShowCustom((prevState) => !prevState);
  }, [setShowCustom]);

  const toggleShowPromoteHints = useCallback(() => {
    setShowPromoteHints((prevState) => !prevState);
  }, [setShowPromoteHints]);

  const shareType = useMemo(() => {
    if (campaign) {
      return 'campaign';
    }
    if (collection) {
      return 'collection';
    }
    if (pageUrl) {
      return 'page';
    }
    return null;
  }, [campaign, collection, pageUrl]);

  const shareText = useMemo(() => {
    if (campaign) {
      return `🚀 Exciting News! 🚀

I’m thrilled to share **${campaign.title}**, which aims to raise **${
        amountGoal
      }**. ${
        campaign.paymentSummary && campaign.paymentSummary.countConfirmed > 1
          ? `We currently have **${campaign.paymentSummary?.countConfirmed}** amazing contributors on board!`
          : ''
      }

🌍 Based in **${campaign.location}**, this project will be live until **${new Date(campaign.endTime).toLocaleDateString()}**.

Your support can make a huge difference! Please check it out and consider contributing or sharing it with your network. Together, we can make this happen!

#Crowdfunding #SupportLocal #${campaign.title.replace(/\s+/g, '')}`;
    }
    if (collection) {
      return `Check out this collection: ${collection.name}`;
    }
    if (pageUrl) {
      return `Check out this link: ${pageUrl}`;
    }
    return null;
  }, [campaign, collection, pageUrl, amountGoal]);

  const shareTitle = useMemo(() => {
    if (campaign) {
      return `Share campaign: ${campaign.title}`;
    }
    if (collection) {
      return `Share collection: ${collection.name}`;
    }
    if (pageUrl) {
      return `Share page: ${pageUrl}`;
    }
    return null;
  }, [campaign, collection, pageUrl]);

  const shareLinks = useMemo(() => {
    if (!shareText || !shareUrl) {
      return [];
    }

    const links = [];
    for (const network of networks) {
      const iconName = `${network.name}Icon`;
      const buttonName = `${network.name}ShareButton`;
      let Icon = undefined;
      let Button = undefined;
      const ReactShareTyped = ReactShare as unknown as Record<
        string,
        React.ElementType
      >;
      if (iconName in ReactShareTyped) {
        Icon = ReactShareTyped[iconName];
      }
      if (buttonName in ReactShareTyped) {
        Button = ReactShareTyped[buttonName];
      }
      if (!Icon || !Button) {
        continue;
      }
      links.push(
        <span
          key={network.name}
          className={cn(
            network.color,
            'flex items-center justify-center',
            'rounded-full p-1 text-white transition-transform',
            'hover:scale-110',
          )}
          title={`Share with ${network.name}`}
        >
          <Button
            url={shareUrl}
            body={shareText}
            subject={shareTitle}
            title={shareTitle}
            summary={shareText}
          >
            <Icon size={40} />
          </Button>
        </span>,
      );
    }
    links.push(
      <span
        key="custom"
        className={cn(
          'bg-primary',
          'flex items-center justify-center',
          'rounded-full p-1 text-white transition-transform',
          'hover:scale-110',
        )}
        title={`Share with Custom`}
      >
        <Button onClick={toggleCustom}>
          <MessageCircleQuestion className="h-10 w-10" />
        </Button>
      </span>,
    );
    return links;
  }, [shareUrl, shareText, shareTitle, toggleCustom, networks]);

  const copyUrlToClipboard = useCallback(() => {
    if (!shareUrl) {
      return;
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast({
          title: 'Link copied!',
          description: 'Link has been copied to clipboard',
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Failed to copy',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
  }, [shareUrl]);
  const copyTextToClipboard = useCallback(() => {
    if (!shareText) {
      return;
    }
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: 'Text copied!',
          description: 'Share text has been copied to clipboard',
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Failed to copy',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
  }, [shareText]);

  useEffect(() => {
    if (!campaign) {
      return;
    }
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/campaigns/${campaign.slug}`);
      return;
    }
    setShareUrl(`/campaigns/${campaign.slug}`);
  }, [campaign]);

  useEffect(() => {
    if (!collection) {
      return;
    }
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/collections/${collection.id}`);
      return;
    }
    setShareUrl(`/collections/${collection.id}`);
  }, [collection]);

  useEffect(() => {
    if (!pageUrl) {
      return;
    }
    setShareUrl(pageUrl);
  }, [pageUrl]);

  if (!shareText || !shareTitle) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          {children ? children : <Share2 className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shareTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(showPromoteHints ? 'hidden' : 'block cursor-help')}
              onClick={toggleShowPromoteHints}
            >
              <strong>Sharing is Caring!</strong>{' '}
              <p>
                By sharing this campaign, you help increase its visibility and
                attract more contributors. The networks displayed here are just
                a subset; you can also copy the promotional text to share on any
                platform. More visibility means a better chance of reaching
                funding goals and engaging supporters beyond your network. Let’s
                spread the word and make this campaign a success!
              </p>
            </div>
            <div
              className={cn(
                showPromoteHints ? 'block cursor-help' : 'hidden',
                'prose h-[50vh] overflow-y-scroll',
              )}
              onClick={toggleShowPromoteHints}
            >
              <h2 className="text-2xl font-bold">
                Maximize Your {shareType}&apos;s Reach: A Guide to Successful
                Promotion
              </h2>

              <ol className="list-decimal pl-5">
                <li>
                  <strong>Know Your Audience:</strong> Tailor your message to
                  resonate with the specific interests and values of your target
                  audience. Understand what motivates them to support{' '}
                  {shareType}
                  like yours.
                </li>
                <li>
                  <strong>Craft Compelling Content:</strong> Use engaging
                  visuals and clear, concise messaging. Highlight the unique
                  aspects of your {shareType} and why it matters. A captivating
                  title and description can make a significant difference.
                </li>
                <li>
                  <strong>Utilize Social Media:</strong> Share your {shareType}
                  across various platforms like Facebook, Twitter, Instagram,
                  and LinkedIn. Each platform has its own audience, so customize
                  your posts accordingly. Use relevant hashtags to increase
                  discoverability.
                </li>
                <li>
                  <strong>Engage with Your Network:</strong> Encourage friends,
                  family, and existing supporters to share your {shareType}.
                  Personal appeals can be very effective. Ask them to share
                  their thoughts on why they believe in your {shareType}.
                </li>
                <li>
                  <strong>Create Shareable Content:</strong> Develop graphics,
                  videos, or infographics that are easy to share. Visual content
                  tends to attract more attention and can be more persuasive
                  than text alone.
                </li>
                <li>
                  <strong>Leverage Influencers:</strong> Reach out to
                  influencers or bloggers in your niche who might be interested
                  in your {shareType}. A mention or share from them can
                  significantly boost your visibility.
                </li>
                <li>
                  <strong>Follow Up:</strong> Keep your supporters updated on
                  your {shareType}&apos;s progress. Regular updates can
                  encourage ongoing engagement and sharing, as people love to
                  see how their contributions are making a difference.
                </li>
                <li>
                  <strong>Encourage Interaction:</strong> Ask questions and
                  invite feedback on your social media posts. Engaging your
                  audience can lead to more shares and discussions, further
                  amplifying your reach.
                </li>
              </ol>

              <p>
                By following these strategies, you can effectively promote your
                {shareType} and increase its chances of success. Remember, every
                share counts!
              </p>
            </div>
            {showCustom ? (
              <div className="flex w-full gap-2">
                <Textarea defaultValue={shareText} readOnly />
                <div className="grid grid-cols-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTextToClipboard}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy Text</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCustom}
                    className="h-8 px-2"
                  >
                    <MessageCircleQuestion className="h-4 w-4" />
                    <span className="sr-only">Copy Text</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid w-full grid-cols-3 gap-2">{shareLinks}</div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              {typeof shareUrl !== 'undefined' && (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="whitespace-normal break-words text-sm text-gray-600">
                    {shareUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyUrlToClipboard}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
