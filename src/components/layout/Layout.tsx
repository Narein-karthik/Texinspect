import {
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDisplayMode } from '../../hooks/useDisplayMode';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { LoginPage } from '../../pages/LoginPage';
import { PublicSite } from '../../pages/PublicSite';
import { useStore } from '../../store';
import { cn } from '../../utils/classNames';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';
import { StatusBar } from './StatusBar';
import { getNavigationItems } from './navigation';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useStore((state) => state.currentUser);
  const { displayMode, changeDisplayMode } = useDisplayMode();

  const isOnline = useOnlineStatus();

  const { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh();

  if (!currentUser) {
    return location.pathname === '/login' ? <LoginPage /> : <PublicSite />;
  }

  const navItems = getNavigationItems(currentUser.role);
  const isDesktopMode = displayMode === 'desktop';
  const showNavigation = !location.pathname.startsWith('/reports/');

  return (
    <div
      className={cn(
        'min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-blue-100 transition-colors duration-300',
        isDesktopMode ? 'pb-8' : 'pb-32'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >

      <StatusBar displayMode={displayMode} />

      <div
        className="fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-white shadow-xl transition-[opacity,transform] duration-200 pointer-events-none"
        style={{
          top: '72px',
          opacity: pullDistance > 8 || isRefreshing ? 1 : 0,
          transform: `translate(-50%, ${Math.max(-18, pullDistance - 42)}px)`,
        }}
      >
        <RefreshCw
          size={15}
          className={isRefreshing ? 'animate-spin' : ''}
          style={{ transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)` }}
        />
        <span className="text-[9px] font-black uppercase tracking-widest">
          {isRefreshing
            ? 'Refreshing'
            : pullDistance >= 64
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </span>
      </div>

      <motion.main
        layout
        transition={{ layout: { duration: 0.28, ease: 'easeOut' } }}
        className={cn(
          'mx-auto p-4 pt-20 animate-in transition-transform duration-150',
          isDesktopMode
            ? 'max-w-6xl px-6 pb-10'
            : 'max-w-xl pb-24'
        )}
        style={{
          transform: pullDistance > 0
            ? `translateY(${Math.min(pullDistance * 0.35, 24)}px)`
            : undefined,
        }}
      >

        <AppHeader currentUser={currentUser} isDesktopMode={isDesktopMode} showNavigation={showNavigation} navItems={navItems} changeDisplayMode={changeDisplayMode} />

        <motion.div
          key={`${displayMode}-${location.pathname}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.div>

      </motion.main>

      {/* Bottom Navigation */}
      {!isDesktopMode && showNavigation && (

        <BottomNavigation navItems={navItems} />
      )}

    </div>
  );
};
