import { useEffect, useState } from 'react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, matchPath } from 'react-router-dom';
import { routes } from '../navigation/routes';
import { BottomNavigation } from './BottomNavigation/BottomNavigation';
import { ProtectedRoute } from './ProtectedRoute';

export function App() {
  const [isRegistered, setIsRegistered] = useState(!!localStorage.getItem('userId'));
  const location = useLocation();

  useEffect(() => {
    setIsRegistered(!!localStorage.getItem('userId'));
  }, [location]);

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  const showBottomNav = !matchPath('/note/:id', location.pathname);

  return (
    <AppRoot>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="page-wrapper"
                >
                  {route.path === '/index' || route.path === '/settings' ? (
                    <ProtectedRoute isRegistered={isRegistered}>
                      <route.Component />
                    </ProtectedRoute>
                  ) : (
                    <route.Component />
                  )}
                </motion.div>
              }
            />
          ))}
          <Route path="*" element={<Navigate to={isRegistered ? '/index' : '/'} />} />
        </Routes>
      </AnimatePresence>
      {isRegistered && location.pathname !== '/' && showBottomNav && <BottomNavigation />}
    </AppRoot>
  );
}
