'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LivePlayer } from '@/components/player/LivePlayer';

export function SiteFrame({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <div className="flex-1 w-full">{children}</div>;
    }

    return (
        <>
            <Header />
            <main className="flex-1 w-full container mx-auto px-4 py-8 pb-24">
                {children}
            </main>
            <LivePlayer />
            <Footer />
        </>
    );
}
