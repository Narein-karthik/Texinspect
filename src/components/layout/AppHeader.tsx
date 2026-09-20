import {
  Monitor,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DisplayMode } from '../../hooks/useDisplayMode';
import type { User } from '../../types';
import { cn } from '../../utils/classNames';
import type { NavigationItem } from './navigation';

interface AppHeaderProps {
  currentUser: User;
  isDesktopMode: boolean;
  showNavigation: boolean;
  navItems: NavigationItem[];
  changeDisplayMode: (mode: DisplayMode) => void;
}

export function AppHeader({ currentUser, isDesktopMode, showNavigation, navItems, changeDisplayMode }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <motion.header
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 py-6 mb-2"
    >

      <h1 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
        <span className="bg-gray-900 text-white p-1.5 rounded-lg text-lg">
          TX
        </span>

        TEXINSPECT
      </h1>

      {isDesktopMode && showNavigation && (
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm md:order-none md:w-auto"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'relative flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-black uppercase transition-colors lg:px-4',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.nav>
      )}

      <div className="flex items-center gap-2">
        <div
          className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
          aria-label="Display mode"
        >
          <button
            type="button"
            onClick={() => changeDisplayMode('mobile')}
            title="Mobile layout"
            aria-label="Use mobile layout"
            aria-pressed={!isDesktopMode}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              !isDesktopMode
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-900'
            )}
          >
            <Smartphone size={15} />
          </button>

          <button
            type="button"
            onClick={() => changeDisplayMode('desktop')}
            title="Desktop layout"
            aria-label="Use desktop layout"
            aria-pressed={isDesktopMode}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              isDesktopMode
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-900'
            )}
          >
            <Monitor size={15} />
          </button>
        </div>

        <motion.button
          onClick={() => navigate('/profile')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 overflow-hidden"
        >
          {currentUser.name.charAt(0)}
        </motion.button>
      </div>

    </motion.header>
  );
}
