'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

type Environment = 'production' | 'staging' | 'development';

interface EnvironmentContextType {
    environment: Environment;
    isProduction: boolean;
    isStaging: boolean;
    isDevelopment: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType>({
    environment: 'development',
    isProduction: false,
    isStaging: false,
    isDevelopment: true,
});

export function EnvironmentProvider({ children }: { children: ReactNode }) {
    const [environment, setEnvironment] = useState<Environment>('development');

    useEffect(() => {
        // Get environment from .env or Vercel
        const env = process.env.NEXT_PUBLIC_ENVIRONMENT ||
            process.env.NEXT_PUBLIC_VERCEL_ENV ||
            'development';

        if (env === 'production' || env === 'staging' || env === 'development') {
            setEnvironment(env);
        } else if (env === 'preview') {
            setEnvironment('staging');
        }
    }, []);

    const value = {
        environment,
        isProduction: environment === 'production',
        isStaging: environment === 'staging',
        isDevelopment: environment === 'development',
    };

    return (
        <EnvironmentContext.Provider value={value}>
            <div className={`env-${environment}`}>
                {children}
            </div>
            {environment !== 'production' && (
                <div className={`fixed bottom-4 right-4 z-50 px-3 py-1 rounded-md text-white font-medium ${environment === 'staging' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}>
                    {environment.toUpperCase()}
                </div>
            )}
        </EnvironmentContext.Provider>
    );
}

export const useEnvironment = () => useContext(EnvironmentContext); 