import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 animate-slide-in-from-top">
      <button 
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 p-2 text-navy-400 hover:text-navy-600"
        aria-label="Close installation prompt"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="mb-4">
        <h3 className="text-lg font-display text-navy-800 mb-1">Install myTABS</h3>
        <p className="text-sm text-navy-600">Add myTABS to your home screen for quick access</p>
      </div>
      
      <button
        onClick={handleInstall}
        className="w-full bg-navy-800 text-white py-3 rounded-xl hover:bg-navy-700 
                 transition-all duration-200 active:scale-95"
      >
        Install App
      </button>
    </div>
  );
} 