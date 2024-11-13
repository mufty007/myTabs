import { Pill } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-navy-800 flex flex-col items-center justify-center">
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 text-white text-3xl font-display">
          <span>my</span>
          <Pill className="w-10 h-10 rotate-45" />
          <span>TABS</span>
        </div>
      </div>
    </div>
  );
}