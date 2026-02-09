import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
            <div className="bg-muted p-6 rounded-full">
                <div className="relative w-16 h-16">
                    {/* Lucide doesn't have RadioOff, improvising */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                    >
                        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                </div>
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Station Not Found</h1>
                <p className="text-muted-foreground max-w-md">We couldn&apos;t find the page you&apos;re looking for. It might be off-air or moved to a new frequency.</p>
            </div>
            <Button asChild size="lg">
                <Link href="/">Return to Home Frequency</Link>
            </Button>
        </div>
    );
}
