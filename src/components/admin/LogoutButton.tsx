'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            await fetch('/api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ action: 'logout' }),
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
        window.location.assign('/admin/login/');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={handleLogout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
    );
}
