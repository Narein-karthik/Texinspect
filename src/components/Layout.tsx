import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Home,
  Monitor,
  PlusSquare,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { signInWithGoogle } from '../lib/firebase';
import { StatusBar } from './StatusBar';

type DisplayMode = 'mobile' | 'desktop';
const DISPLAY_MODE_KEY = 'tex-inspect-display-mode';

const LoginScreen = () => {
  const [loadingAction, setLoadingAction] = React.useState<'INSPECTOR_SIGN_IN' | 'ADMIN_SIGN_IN' | 'INSPECTOR_SIGN_UP' | null>(null);
  const [loginError, setLoginError] = React.useState(
    () => localStorage.getItem('tex-inspect-login-error') || ''
  );

  React.useEffect(() => {
    const syncLoginError = () => {
      setLoginError(localStorage.getItem('tex-inspect-login-error') || '');
    };

    window.addEventListener('tex-inspect-login-error', syncLoginError);
    window.addEventListener('storage', syncLoginError);

    return () => {
      window.removeEventListener('tex-inspect-login-error', syncLoginError);
      window.removeEventListener('storage', syncLoginError);
    };
  }, []);

  const handleAuth = async (
    role: 'INSPECTOR' | 'ADMIN',
    mode: 'SIGN_IN' | 'SIGN_UP'
  ) => {
    const action = `${role}_${mode}` as typeof loadingAction;
    setLoadingAction(action);
    setLoginError('');
    localStorage.removeItem('tex-inspect-login-error');
    localStorage.setItem('tex-inspect-login-role', role);
    localStorage.setItem('tex-inspect-login-mode', mode);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 overflow-hidden relative">

      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center relative z-10"
      >
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <span className="text-3xl font-black text-gray-900">TX</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">
              TexInspect AI
            </h1>

            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Employee Terminal Registry
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-6">
          <p className="text-white/60 text-sm font-medium leading-relaxed">
            Please authenticate using your company account to access the inspection terminal.
          </p>

          {loginError && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left">
              <p className="text-xs font-black uppercase tracking-widest text-red-200">
                Access Denied
              </p>
              <p className="text-sm font-semibold text-red-50 mt-1">
                {loginError}
              </p>
            </div>
          )}

          <div className="grid gap-3">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">
                Existing User
              </p>
            </div>

            <button
              onClick={() => handleAuth('INSPECTOR', 'SIGN_IN')}
              disabled={Boolean(loadingAction)}
              className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              <UserCheck size={20} />

              {loadingAction === 'INSPECTOR_SIGN_IN' ? 'Authenticating...' : 'Login As Inspector'}
            </button>

            <button
              onClick={() => handleAuth('ADMIN', 'SIGN_IN')}
              disabled={Boolean(loadingAction)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-950/30 disabled:opacity-50"
            >
              <ShieldCheck size={20} />

              {loadingAction === 'ADMIN_SIGN_IN' ? 'Authenticating...' : 'Login As Admin'}
            </button>
          </div>

          <div className="grid gap-3 border-t border-white/10 pt-5">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">
                First Time User
              </p>
            </div>

            <button
              onClick={() => handleAuth('INSPECTOR', 'SIGN_UP')}
              disabled={Boolean(loadingAction)}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-950/20 disabled:opacity-50"
            >
              <UserPlus size={20} />

              {loadingAction === 'INSPECTOR_SIGN_UP' ? 'Creating...' : 'Create Inspector Account'}
            </button>
          </div>

          <p className="text-[10px] text-white/35 font-bold leading-relaxed">
            New accounts are created as inspectors. Admin access works only after the account is marked ADMIN in Firebase.
          </p>
        </div>

        <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">
          Authorized Personnel Only • V2.0
        </div>
      </motion.div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useStore((state) => state.currentUser);
  const touchStartY = React.useRef<number | null>(null);
  const pullDistanceRef = React.useRef(0);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>(() => {
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY);
    if (savedMode === 'mobile' || savedMode === 'desktop') return savedMode;
    return window.innerWidth >= 900 ? 'desktop' : 'mobile';
  });

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const changeDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(DISPLAY_MODE_KEY, mode);
  };

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

  if (!currentUser) {
    return <LoginScreen />;
  }

  const navItems = currentUser.role === 'ADMIN'
    ? [
        { icon: Home, label: 'Admin', path: '/' },
        { icon: FileText, label: 'Reports', path: '/reports' },
      ]
    : [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: PlusSquare, label: 'New', path: '/new' },
        { icon: FileText, label: 'Reports', path: '/reports' },
      ];
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

      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="
          fixed bottom-0 left-1/2 -translate-x-1/2
          w-full max-w-xl
          bg-gray-900/95
          backdrop-blur-xl
          border-t border-white/10
          rounded-t-3xl
          px-6 py-4
          flex justify-around items-center
          z-50
        "
      >

        {navItems.map((item) => (

          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.88 }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all touch-target",
              location.pathname === item.path
                ? "text-blue-400"
                : "text-white/40"
            )}
          >
            <item.icon
              size={26}
              strokeWidth={location.pathname === item.path ? 3 : 2}
            />

            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.label}
            </span>

          </motion.button>

        ))}

      </motion.nav>
      )}

    </div>
  );
};
