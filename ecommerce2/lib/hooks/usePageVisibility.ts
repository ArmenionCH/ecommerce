'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to track page visibility state using the Page Visibility API
 * Returns true when the page is visible, false when hidden
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check initial visibility state
    if (typeof document !== 'undefined') {
      setIsVisible(!document.hidden);
    }

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined') {
        setIsVisible(!document.hidden);
      }
    };

    // Add event listener for visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup event listener
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  return isVisible;
}
