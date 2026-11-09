"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Radio, LayoutDashboard, Newspaper, Mic2, Calendar, Inbox } from 'lucide-react';
import { LogoutButton } from '@/components/admin/LogoutButton';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/news', label: 'News Updates', icon: Newspaper, exact: false },
    { href: '/admin/shows', label: 'Shows & Hosts', icon: Mic2, exact: false },
    { href: '/admin/schedule', label: 'Weekly Schedule', icon: Calendar, exact: false },
    { href: '/admin/inbox', label: 'Inbox', icon: Inbox, exact: false },
];

function normalizePath(path: string) {
    if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
    return path;
}

function isActive(pathname: string, href: string, exact: boolean) {
    const current = normalizePath(pathname);
    const target = normalizePath(href);
    if (exact) return current === target;
    return current === target || current.startsWith(`${target}/`);
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname() || '/admin';
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState('Admin');
    const isLogin = pathname.startsWith('/admin/login');

    useEffect(() => {
        if (isLogin) {
            setIsAuthenticated(null);
            return;
        }

        let cancelled = false;

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ action: 'session' }),
                });
                const data = await res.json().catch(() => null);
                if (cancelled) return;
                if (data?.authenticated) {
                    setUsername(data.username || 'Admin');
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    router.replace('/admin/login/');
                }
            } catch {
                if (!cancelled) {
                    setIsAuthenticated(false);
                    router.replace('/admin/login/');
                }
            }
        };

        checkAuth();
        return () => {
            cancelled = true;
        };
    }, [isLogin, router]);

    if (isLogin) {
        return <>{children}</>;
    }

    if (isAuthenticated !== true) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/20 text-muted-foreground">
                Checking access...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
            <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col md:min-h-screen md:sticky md:top-0 md:h-screen">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">Station Admin</h1>
                        <span className="text-xs text-muted-foreground">Control Panel</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(pathname, item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-primary/10 text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="px-4 py-2 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Signed in</p>
                        <p className="text-sm font-medium truncate">{username}</p>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
