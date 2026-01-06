'use client';

import { useEffect } from 'react';

/**
 * Custom hook for setting document title
 * Centralizes document title management across the application
 */
export function useMetaTitle(title: string) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
}
