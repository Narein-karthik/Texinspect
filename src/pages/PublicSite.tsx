import { useLocation, useNavigate } from 'react-router-dom';
import { ContactPage } from './ContactPage';
import { HomePage } from './HomePage';

export const PublicSite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goHome = () => navigate('/');
  const goContact = () => navigate('/contact');
  const goSignIn = () => navigate('/login');

  return location.pathname === '/contact'
    ? <ContactPage onHome={goHome} onSignIn={goSignIn} />
    : <HomePage onContact={goContact} onSignIn={goSignIn} />;
};
