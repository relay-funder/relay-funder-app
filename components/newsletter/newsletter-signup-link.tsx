'use client';

import { Button } from '@/components/ui/button';
import { EXTERNAL_LINKS } from '@/lib/constant';
import { Mail } from 'lucide-react';

interface NewsletterSignupLinkProps {
  label?: string;
  className?: string;
}

export function NewsletterSignupLink({
  label = 'Stay updated — join the Relay Funder newsletter',
  className,
}: NewsletterSignupLinkProps) {
  return (
    <Button asChild variant="secondary" size="sm" className={className}>
      <a
        href={EXTERNAL_LINKS.NEWSLETTER}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}


