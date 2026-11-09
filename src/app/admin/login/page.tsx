'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Radio } from 'lucide-react';

function safeNextPath(value: string | null): string {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
        return '/admin/';
    }
    if (!value.startsWith('/admin') || value.startsWith('/admin/login')) {
        return '/admin/';
    }
    return value;
}

function LoginForm() {
    const searchParams = useSearchParams();
    const nextPath = safeNextPath(searchParams.get('from'));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const username = String(formData.get('username') || '');
        const password = String(formData.get('password') || '');

        try {
            const res = await fetch('/api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ action: 'login', username, password }),
            });
            const data = await res.json().catch(() => null);

            if (!data || !res.ok || !data.success) {
                setError(data?.error || 'Could not reach the login service. Confirm PHP is running on the server.');
                setLoading(false);
                return;
            }

            window.location.assign(nextPath);
        } catch {
            setError('Could not reach the login service. Confirm PHP is running on the server.');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-8">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Radio className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Station Administration</h1>
                    <p className="text-sm text-muted-foreground">Sign in to the control panel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter username"
                            required
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter password"
                            required
                            className="text-lg"
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading} size="lg">
                        {loading ? 'Verifying...' : 'Sign in'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign in...</div>}>
            <LoginForm />
        </Suspense>
    );
}
