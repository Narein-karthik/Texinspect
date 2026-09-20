import React from 'react';

export function usePullToRefresh() {
  const touchStartY = React.useRef<number | null>(null);
  const pullDistanceRef = React.useRef(0);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const scrollContainer = document.getElementById('root');

    if (
      isRefreshing ||
      event.touches.length !== 1 ||
      (scrollContainer?.scrollTop ?? 0) > 0
    ) {
      touchStartY.current = null;
      return;
    }

    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null || isRefreshing) return;

    const scrollContainer = document.getElementById('root');
    if ((scrollContainer?.scrollTop ?? 0) > 0) {
      touchStartY.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      return;
    }

    const distance = event.touches[0].clientY - touchStartY.current;
    const resistedDistance = distance > 0 ? Math.min(distance * 0.45, 96) : 0;

    pullDistanceRef.current = resistedDistance;
    setPullDistance(resistedDistance);
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;

    if (pullDistanceRef.current >= 64) {
      setIsRefreshing(true);
      setPullDistance(56);

      window.setTimeout(() => {
        window.location.reload();
      }, 350);
      return;
    }

    pullDistanceRef.current = 0;
    setPullDistance(0);
  };

  return { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd };
}
