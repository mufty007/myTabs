import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden modal-content max-h-[80vh]">
        {children}
      </div>
    </div>
  );
}