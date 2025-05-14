import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
interface PageProfileProps {
  withBackButton?: boolean;
  message: ReactNode;
  title: ReactNode;
  children: ReactNode;
}
export function PageProfile({
  withBackButton = false,
  message,
  title,
  children,
}: PageProfileProps) {
  return (
    <div className="container mx-auto max-w-4xl px-3 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        {withBackButton && (
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{message}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
