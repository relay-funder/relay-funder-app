'use client';

import { ReactNode, useEffect } from 'react';
import { useNetworkCheck } from '@/hooks/use-network';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface NetworkCheckProps {
    children: ReactNode;
}

export function NetworkCheck({ children }: NetworkCheckProps) {
    const { isCorrectNetwork, switchToAlfajores } = useNetworkCheck();
    const { toast } = useToast();

    useEffect(() => {
        if (!isCorrectNetwork) {
            toast({
                title: "Network Error",
                description: (
                    <div className="mt-2">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm font-medium">
                                Please switch to Celo Alfajores Testnet to use this app
                            </p>
                        </div>
                        <Button 
                            variant="secondary"
                            size="sm" 
                            onClick={switchToAlfajores}
                            className="w-full text-black"
                        >
                            Switch Network
                        </Button>
                    </div>
                ),
                variant: "destructive",
                duration: Infinity,
            });
        }
    }, [isCorrectNetwork, switchToAlfajores, toast]);

    return <>{children}</>;
}
