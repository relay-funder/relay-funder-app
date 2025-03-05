'use client';

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function EnvironmentBadge() {
    const [env, setEnv] = useState<string>("development");
    const [branch, setBranch] = useState<string>("");

    useEffect(() => {
        // Get environment variables on client side
        setEnv(process.env.NEXT_PUBLIC_VERCEL_ENV || "development");
        setBranch(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || "");
    }, []);

    const getColor = () => {
        switch (env) {
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
            {env.toUpperCase()} {branch && `(${branch})`}
        </Badge>
    );
} 