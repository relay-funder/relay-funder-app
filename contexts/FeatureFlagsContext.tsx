'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';

interface FeatureFlagsContextType {
  flags: string[];
  hasFlag: (flag: string) => boolean;
  toggleFeatureFlag: (flag: string) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined,
);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<string[]>([]);
  const toggleFeatureFlag = useCallback(
    (flag: string) => {
      setFlags((prevState: string[]) => {
        if (!prevState.includes(flag)) {
          return prevState.concat(flag);
        }
        return prevState.filter((prevFlag: string) => prevFlag != flag);
      });
    },
    [setFlags],
  );
  const hasFlag = useCallback(
    (flag: string) => {
      return flags.includes(flag);
    },
    [flags],
  );
  const value = useMemo(() => {
    return { flags, toggleFeatureFlag, hasFlag };
  }, [flags, toggleFeatureFlag]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error(
      'useFeatureFlags must be used within a FeatureFlagsProvider',
    );
  }
  return context;
}
export function useFeatureFlag(flag: string) {
  const context = useFeatureFlags();
  const { hasFlag, flags } = useFeatureFlags();
  const flagState = useMemo(() => hasFlag(flag), [flags, flag]);
  return flagState;
}
