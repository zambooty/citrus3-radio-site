import Link from 'next/link';
import { Radio, LayoutDashboard, Newspaper, Mic2, Calendar, Mail } from 'lucide-react';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { auth } from '@/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // Middleware handles redirection, but we can verify here too if needed.

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col min-h-screen sticky top-0 h-screen">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">Station Admin</h1>
                        <span className="text-xs text-muted-foreground">Control Panel</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/news"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Newspaper className="w-4 h-4" />
                        News Updates
                    </Link>
                    <Link
                        href="/admin/shows"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Mic2 className="w-4 h-4" />
                        Shows & Hosts
                    </Link>
                    <Link
                        href="/admin/schedule"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Calendar className="w-4 h-4" />
                        Weekly Schedule
                    </Link>
                    <Link
                        href="/admin/messages"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Mail className="w-4 h-4" />
                        Inbound Messages
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="px-4 py-2 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">User</p>
                        <p className="text-sm font-medium truncate">{session?.user?.email || 'Admin'}</p>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
