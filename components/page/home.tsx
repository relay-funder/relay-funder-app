import { type ReactNode } from 'react';
export function PageHome({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  // flex flex-col items-center justify-center
  return (
    <>
      {header}
      <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <main className="container mx-auto max-w-7xl px-2 py-8 md:px-4">
          {children}
        </main>
      </div>
    </>
  );
}
