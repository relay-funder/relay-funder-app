import { type ReactNode } from 'react';
export function PageDashboard({
  children,
  title = 'My Campaigns',
  actions,
}: {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <header className="mx-auto inline max-h-[200px] min-h-[200px] items-center justify-between p-8">
        <div>
          <div className="ml-2 flex flex-col md:ml-4 md:content-start">
            <div className="mb-0 pl-2 pt-2 align-middle text-3xl font-bold md:mb-8 md:pt-5">
              {title}
              {actions}
            </div>
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100svh-200px)] w-full flex-col bg-gray-50">
        <div className="container mx-auto max-w-7xl p-5">{children}</div>
      </div>
    </>
  );
}
