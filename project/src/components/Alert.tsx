import { useEffect } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Alert({ message, type, isVisible, onClose }: AlertProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }[type];

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 max-w-sm w-full mx-auto z-50 
      ${bgColor} p-4 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-4`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button
          onClick={onClose}
          aria-label="Close alert"
          className="p-1 hover:bg-black/5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}