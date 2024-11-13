import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Prescription } from './types';
import Home from './pages/Home';
import Settings from './pages/Settings';
import SplashScreen from './components/SplashScreen';
import Onboarding from './pages/Onboarding';
import BottomNav from './components/BottomNav';
import { Modal } from './components/Modal';
import AddPrescription from './pages/AddPrescription';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('onboarding_complete', false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    console.log('App state updated:', {
      user,
      hasCompletedOnboarding,
      currentPath: window.location.pathname
    });
  }, [user, hasCompletedOnboarding]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        registration.addEventListener('waiting', () => {
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setIsUpdateAvailable(true);
          }
        });
      });
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setIsUpdateAvailable(false);
    window.location.reload();
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  const handleAddPrescription = async (prescription: Prescription) => {
    if (!user) return;
    
    const newPrescription = {
      ...prescription,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };

    const updatedUser = {
      ...user,
      prescriptions: [...user.prescriptions, newPrescription]
    };

    await Promise.all([
      setUser(updatedUser),
      setHasCompletedOnboarding(true)
    ]);
    
    setIsAddModalOpen(false);
  };

  const routes = [
    {
      path: '/onboarding/*',
      element: hasCompletedOnboarding ? (
        <Navigate to="/home" replace />
      ) : (
        <Onboarding />
      )
    },
    {
      path: '/home',
      element: !user || !user.name ? (
        console.log('Redirecting to onboarding due to missing user/name'),
        <Navigate to="/onboarding" replace />
      ) : !hasCompletedOnboarding ? (
        console.log('Redirecting to onboarding due to incomplete onboarding'),
        <Navigate to="/onboarding" replace />
      ) : (
        console.log('Showing home screen'),
        <Home onAddClick={() => setIsAddModalOpen(true)} />
      )
    },
    {
      path: '/',
      element: <Navigate to="/home" replace />
    },
    {
      path: '/settings',
      element: <Settings />
    }
  ];

  return (
    <div className="pb-16">
      {isUpdateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center">
          <p>New version available! 
            <button 
              onClick={reloadPage}
              className="ml-2 underline"
            >
              Update now
            </button>
          </p>
        </div>
      )}
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      
      {user && user.name && hasCompletedOnboarding && (
        <>
          <BottomNav onAddClick={() => setIsAddModalOpen(true)} />
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
            <AddPrescription
              onSubmit={handleAddPrescription}
              isSubmitting={false}
              onClose={() => setIsAddModalOpen(false)}
              onComplete={() => setIsAddModalOpen(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}