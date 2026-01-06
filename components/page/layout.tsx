import { type ReactNode } from 'react';
import { FullWidthContainer } from '@/components/layout';
import { PageHeaderSearch } from './header-search';

export interface PageLayoutProps {
  title?: string;
  searchPlaceholder?: string;
  onSearchChanged?: (search: string) => void;
  onCreate?: () => void;
  createTitle?: string;
  buttons?: ReactNode;
  searchButtons?: ReactNode;
  containerWidth?: 'default' | 'detail' | 'full';
  children: ReactNode;
  customHeader?: ReactNode;
}

export function PageLayout({
  title,
  searchPlaceholder,
  onSearchChanged,
  onCreate,
  createTitle,
  buttons,
  searchButtons,
  containerWidth = 'default',
  children,
  customHeader,
}: PageLayoutProps) {
  const renderHeader = () => {
    if (customHeader) {
      return customHeader;
    }

    // If we have search functionality, use PageHeaderSearch with integrated title
    if (searchPlaceholder && onSearchChanged) {
      return (
        <PageHeaderSearch
          title={title}
          placeholder={searchPlaceholder}
          onSearchChanged={onSearchChanged}
          onCreate={onCreate}
          createTitle={createTitle}
          buttons={buttons}
          searchButtons={searchButtons}
          containerWidth={containerWidth}
        />
      );
    }

    // If we only have title, show it simply
    if (title) {
      return (
        <div className="px-4 py-6 md:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderHeader()}
      <div className="flex min-h-screen w-full flex-col bg-background">
        <main className="w-full">
          <FullWidthContainer variant="default" padding="sm">
            {children}
          </FullWidthContainer>
        </main>
      </div>
    </>
  );
}
