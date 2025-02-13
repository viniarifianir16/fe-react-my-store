import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/Auth';
import { ReactNode } from 'react';

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const loginRoutesList = ['/signin', '/signup'];
  const privateRouteList = [
    '/dashboard',
    /^\/data\/.*/,
    /^\/transaksi\/.*/,
    /^\/laporan\/.*/,
    '/settings',
  ];

  useEffect(() => {
    const isLoginRoute = loginRoutesList.some(
      (route) => route === location.pathname,
    );
    const isPrivateRoute = privateRouteList.some((route) =>
      typeof route === 'string'
        ? route === location.pathname
        : route.test(location.pathname),
    );

    if (user && isLoginRoute) {
      navigate('/dashboard');
    } else if (!user && isPrivateRoute) {
      navigate('/');
    }
  }, [user, location.pathname, navigate]);

  // Jika user tidak ada dan ini route privat, jangan render anak komponen
  if (
    !user &&
    privateRouteList.some((route) =>
      typeof route === 'string'
        ? route === location.pathname
        : route.test(location.pathname),
    )
  ) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
