import React, { createContext, useState } from 'react';

interface ModalContextType {
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  return (
    <ModalContext.Provider value={{ isAddModalOpen, openAddModal, closeAddModal }}>
      {children}
    </ModalContext.Provider>
  );
}