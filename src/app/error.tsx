'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center px-4">
            <div className="bg-destructive/10 p-6 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Signal Lost</h2>
                <p className="text-muted-foreground max-w-md">Something went wrong while loading this page. We're working on restoring the broadcast.</p>
                {error.message && <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{error.message}</p>}
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
        </div>
    );
}
