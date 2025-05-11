import { useSidebar, useFeatureFlags, useFeatureFlag } from '@/contexts';
import { Switch } from '@/components/ui';
import { cn } from '@/lib/utils';
export function PageNavMenuFeatures() {
  const { isOpen } = useSidebar();
  const showRounds = useFeatureFlag('ENABLE_ROUNDS');
  const { toggleFeatureFlag } = useFeatureFlags();
  return (
    <div
      className={cn(
        'border-t p-2',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
      )}
    >
      <div className="mb-2 whitespace-nowrap px-2 text-xs text-gray-500">
        Developer Options
      </div>
      <div className="flex flex-nowrap items-center justify-between px-2 py-1">
        <span className="whitespace-nowrap text-sm">Enable QF Rounds</span>
        <Switch
          checked={showRounds}
          onCheckedChange={() => toggleFeatureFlag('ENABLE_ROUNDS')}
        />
      </div>
    </div>
  );
}
