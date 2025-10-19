import { cn } from '@/lib/utils';
import { ReadMoreOrLess } from './read-more-or-less';
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';
import { Media } from '@/types/campaign';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, Eye } from 'lucide-react';
import { useToggleHideCampaignUpdate } from '@/lib/hooks/useUpdates';

interface TimelineItemProps {
  id: number;
  date: Date;
  title: string;
  content: string;
  media?: Media[];
  mediaOrder?: string[];
  isLast?: boolean;
  creatorAddress?: string;
  isHidden?: boolean;
  campaignId: number;
}

export function TimelineItem({
  id,
  date,
  title,
  content,
  media,
  isHidden,
  campaignId,
}: TimelineItemProps) {
  const { mutateAsync: toggleHide, isPending } = useToggleHideCampaignUpdate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const images =
    media?.filter(
      (item) =>
        typeof item.url === 'string' && item.mimeType.startsWith('image/'),
    ) || [];

  const handleToggleHide = async () => {
    try {
      await toggleHide({ campaignId, updateId: id });
    } catch (error) {
      console.error('Failed to toggle hide:', error);
    }
  };

  return (
    <Card id={`update-${id}`} className="scroll-mt-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                {typeof isHidden === 'boolean' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleHide}
                    disabled={isPending}
                    className="h-6 px-2 text-xs"
                  >
                    {isHidden ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {isHidden ? 'Unhide' : 'Hide'}
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {new Date(date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="prose mt-2 max-w-none">
              <ReadMoreOrLess
                className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
                collapsedClassName="line-clamp-3"
              >
                {content}
              </ReadMoreOrLess>
            </div>
            {media && media.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className={`relative h-32 w-full ${item.mimeType.startsWith('image/') ? 'cursor-pointer' : ''}`}
                    onClick={
                      item.mimeType.startsWith('image/')
                        ? () => {
                            const idx = images.findIndex(
                              (img) => img.id === item.id,
                            );
                            if (idx !== -1) {
                              setCurrentIndex(idx);
                              setIsOpen(true);
                            }
                          }
                        : undefined
                    }
                  >
                    {typeof item.url !== 'string' ? (
                      <></>
                    ) : item.mimeType.startsWith('image/') ? (
                      <Image
                        src={item.url}
                        alt={item.caption || 'Campaign update image'}
                        fill
                        className="rounded-lg object-cover"
                      />
                    ) : item.mimeType.startsWith('video/') ? (
                      <video
                        src={item.url}
                        className="h-full w-full rounded-lg object-cover"
                        controls
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="h-[80vh] w-full max-w-4xl p-0">
                <VisuallyHidden>
                  <DialogHeader>
                    <DialogTitle>Image Viewer</DialogTitle>
                  </DialogHeader>
                </VisuallyHidden>
                {images.length > 0 && (
                  <div className="relative h-full w-full">
                    <Image
                      src={images[currentIndex].url as string}
                      alt={
                        images[currentIndex].caption || 'Campaign update image'
                      }
                      fill
                      className="object-contain"
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          className="absolute left-2 top-1/2 -translate-y-1/2 transform p-2"
                          onClick={() =>
                            setCurrentIndex(
                              (prev) =>
                                (prev - 1 + images.length) % images.length,
                            )
                          }
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="absolute right-2 top-1/2 -translate-y-1/2 transform p-2"
                          onClick={() =>
                            setCurrentIndex(
                              (prev) => (prev + 1) % images.length,
                            )
                          }
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {images.length > 0 && images[currentIndex].caption && (
                  <DialogFooter className="p-4">
                    <p className="text-sm text-muted-foreground">
                      {images[currentIndex].caption}
                    </p>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineProps {
  items: Array<{
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    media?: Media[];
    mediaOrder?: string[];
    isHidden?: boolean;
  }>;
  className?: string;
  creatorAddress?: string;
  campaignId: number;
}

export function Timeline({
  items,
  className,
  creatorAddress,
  campaignId,
}: TimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          id={item.id}
          date={item.createdAt}
          title={item.title}
          content={item.content}
          media={item.media}
          isLast={index === items.length - 1}
          creatorAddress={creatorAddress}
          campaignId={campaignId}
          isHidden={item.isHidden}
        />
      ))}
    </div>
  );
}
