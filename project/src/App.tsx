import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Prescription } from './types';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import BottomNav from './components/BottomNav';
import { Modal } from './components/Modal';
import AddPrescription from './pages/AddPrescription';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Add this type declaration before the App component
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function App() {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('onboarding_complete', false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    console.log('App state updated:', {
      user,
      hasCompletedOnboarding,
      currentPath: window.location.pathname
    });
  }, [user, hasCompletedOnboarding]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setIsUpdateAvailable(false);
    window.location.reload();
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
  };

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
      {deferredPrompt && (
        <button onClick={handleInstallClick}>
          Install App
        </button>
      )}
    </div>
  );
}
