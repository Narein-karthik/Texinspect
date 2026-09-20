import { ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useLogin } from '../features/auth/useLogin';

export const LoginPage = () => {
  const { loadingAction, loginError, handleAuth } = useLogin();

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

