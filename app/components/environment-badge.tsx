'use client';

import { Badge } from "@/components/ui/badge";
import { useEnvironment } from "./environment-theme-provider";

export function EnvironmentBadge() {
    const { environment, gitBranch } = useEnvironment();

    const getColor = () => {
        switch (environment) {
            case 'production':
                return 'bg-green-600 hover:bg-green-700';
            case 'preview':
                return 'bg-yellow-600 hover:bg-yellow-700';
            case 'development':
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    return (
        <Badge className={`${getColor()} fixed bottom-4 right-4 z-50`}>
            {environment.toUpperCase()} ({gitBranch})
        </Badge>
    );
}