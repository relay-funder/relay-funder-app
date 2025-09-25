import { useState, useCallback, type ChangeEvent, ReactNode } from 'react';
import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { FullWidthContainer, DetailContainer } from '@/components/layout';

export interface UnifiedHeaderProps {
  title: string;
  searchPlaceholder: string;
  onSearchChanged: (search: string) => void;
  onCreate?: () => void;
  createTitle?: string;
  buttons?: ReactNode;
  containerWidth?: 'default' | 'detail' | 'full';
  showWalletConnect?: boolean;
}

export function UnifiedHeader({
  title,
  searchPlaceholder,
  onSearchChanged,
  onCreate,
  createTitle,
  buttons,
  containerWidth = 'default',
  showWalletConnect = true,
}: UnifiedHeaderProps) {
  const { login, authenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const onConnect = useCallback(() => {
    if (authenticated) {
      router.push('/profile');
      return;
    }
    login();
  }, [login, authenticated, router]);

  const onSearchInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      onSearchChanged(event.target.value);
    },
    [setSearchTerm, onSearchChanged],
  );

  const renderDesktopContent = () => (
    <div className="flex min-h-[100px] flex-wrap items-center pl-1 pt-[2px] md:min-h-0">
      {/* Title */}
      <div className="mr-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="flex flex-row items-center py-1">
        <div className="relative">
          <Search
            className={cn(
              'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400',
            )}
          />
          <Input
            className="w-[calc(100vw-88px)] rounded-xl pl-10 md:max-w-sm"
            placeholder={searchPlaceholder}
            type="search"
            value={searchTerm}
            onChange={onSearchInputChanged}
          />
        </div>
      </div>

      <div className="grow" />

      {/* Actions */}
      <div className="flex flex-row items-center gap-4">
        {showWalletConnect && (
          <Button
            variant="outline"
            className="bg-purple-50 font-semibold text-purple-600 hover:bg-purple-100"
            onClick={onConnect}
          >
            {authenticated ? 'Connected' : 'Connect Wallet'}
            <Image src="/wallet-icon.png" alt="wallet" width={14} height={14} />
          </Button>
        )}
        {typeof onCreate === 'function' && typeof createTitle === 'string' && (
          <Button
            className="bg-emerald-400 font-semibold hover:bg-emerald-500"
            onClick={onCreate}
          >
            {createTitle}
          </Button>
        )}
        {buttons}
      </div>
    </div>
  );

  const renderMobileContent = () => (
    <div className="space-y-4 px-4 py-4 md:hidden">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          className={cn(
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400',
          )}
        />
        <Input
          className="w-full rounded-xl pl-10"
          placeholder={searchPlaceholder}
          type="search"
          value={searchTerm}
          onChange={onSearchInputChanged}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {typeof onCreate === 'function' && typeof createTitle === 'string' && (
          <Button
            className="w-full bg-emerald-400 font-semibold hover:bg-emerald-500"
            onClick={onCreate}
          >
            {createTitle}
          </Button>
        )}
        {buttons}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      {renderMobileContent()}

      {/* Desktop Header */}
      <header className="hidden justify-between p-0 md:block md:p-4">
        {containerWidth === 'detail' ? (
          <DetailContainer variant="standard" padding="none">
            {renderDesktopContent()}
          </DetailContainer>
        ) : containerWidth === 'default' ? (
          <FullWidthContainer variant="default" padding="none">
            {renderDesktopContent()}
          </FullWidthContainer>
        ) : (
          renderDesktopContent()
        )}
      </header>
    </>
  );
}
