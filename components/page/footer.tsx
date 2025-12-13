'use client';

import { EXTERNAL_LINKS, SUPPORT_EMAIL } from '@/lib/constant';
import { Mail } from 'lucide-react';

export function PageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-4">
          {/* Social Links - Left Side on Desktop, Second on Mobile */}
          <div className="order-2 flex items-center justify-center gap-8 text-sm sm:order-1 sm:justify-start">
            <a
              href={EXTERNAL_LINKS.TWITTER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-text-muted transition-colors hover:text-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={EXTERNAL_LINKS.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </div>

          {/* Navigation Links - Stacked on Mobile */}
          <div className="order-1 flex flex-col items-center gap-3 text-center text-sm sm:order-2 sm:flex-row sm:gap-4 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-4">
              <a
                href={EXTERNAL_LINKS.ABOUT}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                About
              </a>
              <a
                href={EXTERNAL_LINKS.PARTNERS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                Partners
              </a>
              <a
                href={EXTERNAL_LINKS.FAQ}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                FAQ
              </a>
              <a
                href={EXTERNAL_LINKS.NEWSLETTER}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-text-muted transition-colors hover:text-text-primary"
              >
                <Mail className="h-4 w-4" />
                Newsletter
              </a>
              <a
                href={EXTERNAL_LINKS.PRIVACY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                Privacy
              </a>
              <a
                href={EXTERNAL_LINKS.TERMS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                Terms
              </a>
            </div>
            <div className="text-text-muted">
              Need support? Contact{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-text-muted underline transition-colors hover:text-text-primary"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="text-text-muted">
              © {currentYear} Relay Funder Inc., PBC
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
