import { type ReactNode } from 'react';
export function PageDashboard({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="mx-auto inline items-center justify-between p-8">
        <div>
          <div className="ml-2 flex flex-col md:ml-4 md:content-start">
            <div className="mb-8 pl-2 pt-2 text-3xl font-bold md:pt-5">
              Dashboard
            </div>
          </div>
        </div>
      </header>
      <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <div className="container mx-auto max-w-7xl p-5">{children}</div>
      </div>
    </>
  );
}
