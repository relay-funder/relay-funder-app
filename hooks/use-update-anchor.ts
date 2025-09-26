'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseUpdateAnchorProps {
  onUpdateTarget?: (updateId: string) => void;
}

export function useUpdateAnchor({ onUpdateTarget }: UseUpdateAnchorProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const scrollToUpdate = useCallback((updateId: string) => {
    const element = document.getElementById(`update-${updateId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      return true;
    }
    return false;
  }, []);

  const handleUpdateAnchor = useCallback(
    (hash: string) => {
      if (!hash.startsWith('#update-')) return false;

      const updateId = hash.replace('#update-', '');

      // Notify parent component about the target update
      onUpdateTarget?.(updateId);

      // Try to scroll immediately
      const scrolled = scrollToUpdate(updateId);

      // If element not found, wait and retry
      if (!scrolled) {
        const retryScroll = () => {
          const success = scrollToUpdate(updateId);
          if (!success) {
            // Retry after a short delay if still not found
            setTimeout(retryScroll, 100);
          }
        };

        // Wait for potential DOM updates
        setTimeout(retryScroll, 50);
      }

      return true;
    },
    [scrollToUpdate, onUpdateTarget],
  );

  // Handle initial fragment on page load (only once)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        handleUpdateAnchor(hash);
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle fragment changes (for single-page navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        handleUpdateAnchor(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleUpdateAnchor]);

  return {
    scrollToUpdate,
    handleUpdateAnchor,
  };
}
