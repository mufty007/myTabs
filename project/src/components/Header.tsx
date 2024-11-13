import React from 'react';
import { PillIcon } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <div className="bg-navy-800 p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-navy-200">Hello</p>
          <h1 className="text-3xl font-display text-white">{userName}</h1>
        </div>
        <div className="flex items-center text-white">
          <span className="font-display text-lg mr-2">my</span>
          <PillIcon className="w-6 h-6 rotate-45" />
          <span className="font-display text-lg">TABS</span>
        </div>
      </div>
    </div>
  );
};

export default Header;