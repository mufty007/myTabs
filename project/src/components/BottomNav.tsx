import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Settings } from 'lucide-react';

interface BottomNavProps {
  onAddClick: () => void;
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-navy-100 pb-safe-area">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between relative">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200
            ${location.pathname === '/' 
              ? 'text-white bg-navy-800 shadow-lg' 
              : 'text-navy-400 hover:bg-navy-50'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Home</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <button
            onClick={onAddClick}
            aria-label="Add new item"
            className="bg-navy-800 text-white p-4 rounded-full shadow-lg hover:bg-navy-700 
              transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-180"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200
            ${location.pathname === '/settings' 
              ? 'text-white bg-navy-800 shadow-lg' 
              : 'text-navy-400 hover:bg-navy-50'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}