'use client';

import { Badge } from "@/components/ui/badge";

export function EnvironmentBadge() {
    // VERCEL_ENV is automatically set by Vercel
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';
    const gitBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'local';

    const getColor = () => {
        switch (env) {
            case 'production':
                return 'bg-green-600 hover:bg-green-700';
            case 'preview':
                return 'bg-yellow-600 hover:bg-yellow-700'; // for staging
            case 'development':
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    return (
        <Badge className={`${getColor()} fixed bottom-4 right-4 z-50`}>
            {env.toUpperCase()} ({gitBranch})
        </Badge>
    );
} 