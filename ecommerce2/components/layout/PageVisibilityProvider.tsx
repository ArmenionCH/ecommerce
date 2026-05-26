'use client';

import { useEffect, createContext, useContext, useState } from 'react';

interface VisibilityContextType {
  isVisible: boolean;
}

const VisibilityContext = createContext<VisibilityContextType>({
  isVisible: true,
});

export function usePageVisibility() {
  return useContext(VisibilityContext);
}

export function PageVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check initial visibility state
    setIsVisible(!document.hidden);

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsVisible(!isHidden);

      // Add/remove CSS class to body for CSS optimizations
      if (isHidden) {
        document.body.classList.add('page-hidden');
      } else {
        document.body.classList.remove('page-hidden');
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.classList.remove('page-hidden');
    };
  }, []);

  return (
    <VisibilityContext.Provider value={{ isVisible }}>
      {children}
    </VisibilityContext.Provider>
  );
}
