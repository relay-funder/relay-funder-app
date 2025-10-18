import { useContext } from 'react';
import ConfirmContext from '@/contexts/ConfirmContext';

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
