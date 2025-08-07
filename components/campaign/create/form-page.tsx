import { Button } from '@/components/ui';
import { useMemo } from 'react';
import { CampaignCreateFormStates } from './form-states';
import { cn } from '@/lib/utils';

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
  const buttons = useMemo(() => {
    const next = onStateChanged && CampaignCreateFormStates[state].next && (
      <Button key="next" size={'lg'} type="submit">
        {CampaignCreateFormStates[state].next.label}
      </Button>
    );
    const prev = onStateChanged && CampaignCreateFormStates[state].prev && (
      <Button
        key="prev"
        variant={'secondary'}
        size={'lg'}
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
    return [prev, next];
  }, [state, onStateChanged]);
  if (state !== page) {
    return null;
  }
  return (
    <div className={cn('grid grid-cols-1', 'md:grid-cols-2')}>
      <div
        className={cn(
          'space-y-6 overflow-y-auto p-1',
          'md:overflow-y-visible md:p-6',
          'max-h-[calc(50svh-100px)]',
          // header, container, buttons
          'md:max-h-[calc(100svh-202px-40px-50px)]',
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          'prose prose-sm',
          'overflow-y-auto p-1',
          'md:prose-lg md:overflow-y-hidden md:p-6',
          'max-h-[calc(50svh-100px)]',
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
          'col-span-2 flex h-[50px] grid-cols-1 justify-center pt-2 align-bottom',
          'md:grid-cols-2',
        )}
      >
        {buttons}
      </div>
    </div>
  );
}
