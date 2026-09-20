import React from 'react';
import { signInWithGoogle } from '../../services/firebase/client';
import { LOGIN_ERROR_KEY, LOGIN_MODE_KEY, LOGIN_ROLE_KEY } from './constants';

export function useLogin() {
  const [loadingAction, setLoadingAction] = React.useState<'INSPECTOR_SIGN_IN' | 'ADMIN_SIGN_IN' | 'INSPECTOR_SIGN_UP' | null>(null);
  const [loginError, setLoginError] = React.useState(
    () => localStorage.getItem(LOGIN_ERROR_KEY) || ''
  );

  React.useEffect(() => {
    const syncLoginError = () => {
      setLoginError(localStorage.getItem(LOGIN_ERROR_KEY) || '');
    };

    window.addEventListener(LOGIN_ERROR_KEY, syncLoginError);
    window.addEventListener('storage', syncLoginError);

    return () => {
      window.removeEventListener(LOGIN_ERROR_KEY, syncLoginError);
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
    localStorage.removeItem(LOGIN_ERROR_KEY);
    localStorage.setItem(LOGIN_ROLE_KEY, role);
    localStorage.setItem(LOGIN_MODE_KEY, mode);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  return { loadingAction, loginError, handleAuth };
}
