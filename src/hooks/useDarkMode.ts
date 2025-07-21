import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isUserPreference, setIsUserPreference] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') !== null;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Only save to localStorage if user has explicitly set a preference
    if (isUserPreference) {
      localStorage.setItem('darkMode', isDarkMode.toString());
    }
  }, [isDarkMode, isUserPreference]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a manual preference
      if (!isUserPreference) {
        setIsDarkMode(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [isUserPreference]);

  const toggleDarkMode = () => {
    setIsUserPreference(true);
    setIsDarkMode(!isDarkMode);
  };

  const resetToSystemPreference = () => {
    setIsUserPreference(false);
    localStorage.removeItem('darkMode');
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  return { isDarkMode, toggleDarkMode, resetToSystemPreference, isUserPreference };
}
