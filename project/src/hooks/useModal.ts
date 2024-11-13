import { useContext } from 'react';
import { ModalContext } from '../contexts/ModalContext';

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 