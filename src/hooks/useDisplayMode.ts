import React from 'react';

export type DisplayMode = 'mobile' | 'desktop';
const DISPLAY_MODE_KEY = 'tex-inspect-display-mode';

export function useDisplayMode() {
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>(() => {
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY);
    if (savedMode === 'mobile' || savedMode === 'desktop') return savedMode;
    return window.innerWidth >= 900 ? 'desktop' : 'mobile';
  });

  const changeDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(DISPLAY_MODE_KEY, mode);
  };

  return { displayMode, changeDisplayMode };
}
