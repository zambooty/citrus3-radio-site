import { Radio } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="relative">
                <Radio className="w-16 h-16 text-primary animate-pulse" />
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Tuning in...</p>
        </div>
    );
}
