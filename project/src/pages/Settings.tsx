import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { 
  ChevronRight, 
  Bell, 
  User as UserIcon, 
  Trash2, 
  ArrowLeft, 
  Download,
  Share,
} from 'lucide-react';
import { Alert } from '../components/Alert';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

// Helper function to detect iOS
const isIOS = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
      navigator.platform
    ) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [notifications, setNotifications] = useLocalStorage('notifications', true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice] = useState(isIOS());
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        ('standalone' in window.navigator && (window.navigator as Navigator & { standalone: boolean }).standalone);
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      setAlert({
        show: true,
        message: 'App was successfully installed!',
        type: 'success'
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleUpdateName = () => {
    if (newName.trim() && user) {
      setUser({
        ...user,
        name: newName.trim()
      });
      setIsEditingName(false);
    }
  };

  const handleResetApp = () => {
    localStorage.clear();
    navigate('/onboarding/name');
  };

  const handleNotificationToggle = async () => {
    if (!notifications) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifications(true);
          setAlert({
            show: true,
            message: 'Notifications enabled successfully',
            type: 'success'
          });
        } else {
          setAlert({
            show: true,
            message: 'Permission denied. Please enable notifications in your browser settings.',
            type: 'error'
          });
        }
      } catch (err) {
        console.error(err);
        setAlert({
          show: true,
          message: 'Failed to enable notifications',
          type: 'error'
        });
      }
    } else {
      setNotifications(false);
      setAlert({
        show: true,
        message: 'Notifications disabled',
        type: 'info'
      });
    }
  };

  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      setAlert({
        show: true,
        message: 'This browser does not support notifications',
        type: 'error'
      });
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from myTABS',
        icon: '/pill-icon.png',
        badge: '/pill-icon.png',
        tag: 'test-notification',
        requireInteraction: true
      });
    } else {
      setAlert({
        show: true,
        message: 'Please enable notifications first',
        type: 'error'
      });
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setAlert({
        show: true,
        message: isIOSDevice 
          ? 'Please use the share button in your browser and select "Add to Home Screen"' 
          : 'Installation is not available at this time',
        type: 'info'
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setAlert({
          show: true,
          message: 'Thank you for installing our app!',
          type: 'success'
        });
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: 'There was an error installing the app',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Alert
        isVisible={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />

      <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
        <div className="bg-navy-800 p-6">
          <button
            onClick={() => navigate('/')}
            className="text-white flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-display text-white">Settings</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-display text-gray-900">Profile</h2>
            {isEditingName ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                  placeholder="Enter your name"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateName}
                    className="flex-1 bg-navy-800 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user?.name || '');
                    }}
                    className="flex-1 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Name</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>{user?.name}</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            )}
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-display text-gray-900">Notifications</h2>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Medication Reminders</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={handleNotificationToggle}
                  className="sr-only peer"
                  aria-label="Toggle medication reminders"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
              </label>
            </div>
            <button
              onClick={handleTestNotification}
              className="w-full p-4 bg-navy-50 text-navy-600 rounded-lg hover:bg-navy-100 transition-colors"
            >
              Test Notification
            </button>
          </div>

          {/* Installation Section */}
          {!isStandalone && (
            <div className="space-y-4">
              <h2 className="text-lg font-display text-gray-900">Installation</h2>
              {isIOSDevice ? (
                <button
                  onClick={() => {
                    setAlert({
                      show: true,
                      message: 'To install: tap the share button below, then select "Add to Home Screen"',
                      type: 'info'
                    });
                  }}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <Share className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Add to Home Screen</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Download className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">Install App</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  {!isInstallable && (
                    <p className="text-sm text-gray-500 px-4">
                      To install, please use Chrome or Edge on desktop, or any modern browser on Android
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Danger Zone */}
          <div className="space-y-4">
            <h2 className="text-lg font-display text-red-600">Danger Zone</h2>
            {showResetConfirm ? (
              <div className="p-4 bg-red-50 rounded-lg space-y-4">
                <p className="text-red-600">Are you sure you want to reset the app? This action cannot be undone.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleResetApp}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 text-red-600"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5" />
                  <span>Reset App</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}