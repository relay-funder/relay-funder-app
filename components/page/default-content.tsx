import { ReactNode } from 'react';

export function PageDefaultContent({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="text-center">
        <div className="mb-4 text-3xl font-bold">{title}</div>
      </div>
      <div className="space-y-4">
        <div className="gap-4 p-4">{children}</div>
      </div>
    </>
  );
}
