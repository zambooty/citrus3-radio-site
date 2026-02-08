'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Radio } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/admin';
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            const res = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Invalid password');
                setLoading(false);
            } else {
                router.push(from);
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred');
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
                    <p className="text-sm text-muted-foreground">Authorized personnel only</p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter username"
                            required
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Access Key</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter admin password"
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
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
