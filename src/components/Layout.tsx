import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusSquare, FileText, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { signInWithGoogle } from '../lib/firebase';
import { StatusBar } from './StatusBar';

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-blue-100 pb-32">

      <StatusBar />

      <main className="max-w-xl mx-auto p-4 pt-20 pb-24 animate-in">

        <header className="flex items-center justify-between py-6 mb-2">

          <h1 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <span className="bg-gray-900 text-white p-1.5 rounded-lg text-lg">
              TX
            </span>

            TEXINSPECT
          </h1>

          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 active:scale-90 transition-all overflow-hidden"
          >
            {currentUser.name.charAt(0)}
          </button>

        </header>

        {children}

      </main>

      {/* Bottom Navigation */}
      {!location.pathname.startsWith("/reports/") && (

      <nav
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

          <button
            key={item.path}
            onClick={() => navigate(item.path)}
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

          </button>

        ))}

      </nav>
      )}

    </div>
  );
};
