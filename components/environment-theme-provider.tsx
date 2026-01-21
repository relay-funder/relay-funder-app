'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { APP_ENV, AppEnvironment } from '@/lib/utils/env';

interface EnvironmentContextType {
  environment: AppEnvironment;
  isProduction: boolean;
  isPreview: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  gitBranch: string;
}

const EnvironmentContext = createContext<EnvironmentContextType>({
  environment: 'development',
  isProduction: false,
  isPreview: false,
  isStaging: false,
  isDevelopment: true,
  gitBranch: 'local',
});

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironment] = useState<AppEnvironment>('development');
  const [gitBranch, setGitBranch] = useState<string>('local');

  useEffect(() => {

    setEnvironment(APP_ENV);
    const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'local';
    setGitBranch(branch);
  }, []);

  const value = {
    environment,
    isProduction: environment === 'production',
    isPreview: environment === 'staging',
    isStaging: environment === 'staging',
    isDevelopment: environment === 'development',
    gitBranch,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => useContext(EnvironmentContext);
