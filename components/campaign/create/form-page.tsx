import { Button } from '@/components/ui';
import { useMemo, useState } from 'react';
import { CampaignCreateFormStates } from './form-states';
import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';

export function CampaignCreateFormPage({
  state,
  page,
  children,
  onStateChanged,
}: {
  state: keyof typeof CampaignCreateFormStates;
  page: keyof typeof CampaignCreateFormStates;
  children: React.ReactNode;
  onStateChanged?: (arg0: keyof typeof CampaignCreateFormStates) => void;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const buttons = useMemo(() => {
    const next = onStateChanged && CampaignCreateFormStates[state].next && (
      <Button
        key="next"
        size={'lg'}
        type="submit"
        className={cn(showInfo && 'hidden')}
      >
        {CampaignCreateFormStates[state].next.label}
      </Button>
    );
    const prev = onStateChanged && CampaignCreateFormStates[state].prev && (
      <Button
        key="prev"
        variant={'secondary'}
        size={'lg'}
        className={cn(showInfo && 'hidden')}
        onClick={(event: React.MouseEvent) => {
          event?.preventDefault(); // prevent submit
          if (CampaignCreateFormStates[state].prev?.target) {
            onStateChanged(CampaignCreateFormStates[state].prev.target);
          }
        }}
      >
        {CampaignCreateFormStates[state].prev.label}
      </Button>
    );
    const info = state !== 'introduction' && (
      <Button
        key="info"
        size={'lg'}
        type="submit"
        variant={showInfo ? 'default' : 'ghost'}
        className="block md:hidden"
        onClick={(event: React.MouseEvent) => {
          event?.preventDefault(); // prevent submit
          setShowInfo((prevState) => !prevState);
        }}
      >
        {showInfo ? <X /> : <Info />}
      </Button>
    );
    return [info, prev, next];
  }, [state, onStateChanged, showInfo]);
  if (state !== page) {
    return null;
  }
  return (
    <div className={cn('grid', 'grid-cols-1', 'md:grid-cols-2')}>
      <div
        className={cn(
          showInfo && 'hidden',
          'w-full',
          'space-y-6 overflow-y-auto p-1',
          'md:overflow-y-auto md:p-6',
          'h-[calc(100svh-200px)]',
          // header, container, buttons
          'md:h-[calc(100svh-202px-40px-50px)]',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Form inputs, must not be wrapped in <div>*/}
          {children}
        </div>
      </div>
      <div
        className={cn(
          'w-full max-w-full',
          'prose prose-sm',
          'overflow-y-auto p-1',

          'md:prose-lg md:overflow-y-hidden md:p-6',
          showInfo ? 'h-[calc(100svh-200px)]' : 'hidden',
          'md:block',
          'md:max-h-[calc(100svh-202px-40px-50px)]',
        )}
      >
        <h2>{CampaignCreateFormStates[page].title}</h2>
        <div
          className={cn(
            'overflow-y-visible',
            'md:overflow-y-auto',
            'h-[calc(50svh-100px-50px)]',
            // 200: header, 40: container, 50 buttons, 40 title, 48 prose-padding
            'md:h-[calc(100svh-202px-40px-50px-40px-48px)]',
          )}
        >
          {CampaignCreateFormStates[page].description}
        </div>
      </div>
      <div
        className={cn(
          'w-full',
          'flex h-[50px] grid-cols-1 justify-center pt-2 align-bottom',
          'md:col-span-2',
        )}
      >
        {buttons}
      </div>
    </div>
  );
}
