"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SongRequestForm() {
    return (
        <Suspense fallback={<div className="h-64 rounded-lg bg-muted animate-pulse" />}>
            <SongRequestFields />
        </Suspense>
    );
}

function SongRequestFields() {
    const searchParams = useSearchParams();
    const presetArtist = searchParams.get('artist') || '';
    const presetTitle = searchParams.get('title') || '';
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as Record<string, string>;

        // Basic validation
        if (!data.artist || !data.title || !data.name || !data.email) {
            setStatus('error');
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        // Submit to API
        try {
            const result = await import('@/lib/api').then(m => m.submitRequest({
                artist: data.artist,
                title: data.title,
                name: data.name, // Look at API route, it expects 'sender'
                sender: data.name,
                email: data.email,
                dedication: data.dedication
            }));

            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to submit request.');
            }
        } catch {
            setStatus('error');
            setErrorMessage('Failed to submit request. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-8 rounded-lg text-center border border-green-200 dark:border-green-900">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-bold mb-2">Request Received!</h3>
                <p>Thanks. The hosts have your song request.</p>
                <Button
                    variant="outline"
                    className="mt-6 border-green-600 text-green-700 hover:bg-green-100"
                    onClick={() => setStatus('idle')}
                >
                    Make Another Request
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card text-card-foreground rounded-lg p-6 md:p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                Request a Song
            </h2>
            {(presetArtist || presetTitle) && (
                <p className="text-sm text-muted-foreground -mt-4">
                    Filled in from what&apos;s playing. Add your name and send it to the hosts.
                </p>
            )}

            {status === 'error' && (
                <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="artist" className="text-sm font-medium block">
                            Artist Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="text"
                            id="artist"
                            name="artist"
                            placeholder="e.g. The Beatles"
                            defaultValue={presetArtist}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium block">
                            Song Title <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Hey Jude"
                            defaultValue={presetTitle}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="dedication" className="text-sm font-medium block">
                        Dedicated To <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                        type="text"
                        id="dedication"
                        name="dedication"
                        placeholder="e.g. My mom's birthday"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium block">
                            Your Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Jane Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium block">
                            Your Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="jane@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" className="w-full md:w-auto" disabled={status === 'submitting'}>
                        {status === 'submitting' ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Send Request <Send size={16} />
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
