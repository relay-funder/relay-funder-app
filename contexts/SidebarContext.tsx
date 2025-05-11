'use client';
import { useDebouncedCallback } from 'use-debounce';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const lastOpen = useRef(0);
  const setOpen = useCallback(
    (newState: boolean) => {
      setIsOpen(newState);
    },
    [setIsOpen],
  );
  const setOpenDebounced = useDebouncedCallback(setOpen, 100);
  const value = useMemo(() => {
    return {
      isOpen,
      setIsOpen: setOpenDebounced,
    };
  }, [isOpen, setOpenDebounced]);
  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
