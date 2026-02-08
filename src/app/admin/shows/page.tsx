'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Show } from '@/lib/api';

export default function AdminShowsList() {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchShows();
    }, []);

    const fetchShows = async () => {
        try {
            const res = await fetch('/api/admin/data?file=shows');
            if (res.ok) {
                const data = await res.json();
                // Sort alphabetically by title
                data.sort((a: Show, b: Show) => a.title.localeCompare(b.title));
                setShows(data);
            }
        } catch (error) {
            console.error('Failed to fetch shows', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this show? This might break the schedule if assigned.')) return;

        const updatedShows = shows.filter(item => item.id !== id);

        try {
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'shows', content: updatedShows })
            });

            if (res.ok) {
                setShows(updatedShows);
                router.refresh();
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            alert('Error deleting item');
        }
    };

    if (loading) return <div>Loading shows...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Radio Shows</h1>
                    <p className="text-muted-foreground">Manage show profiles and details.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/shows/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Show
                    </Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.map((show) => (
                    <div key={show.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{show.title}</h3>
                                <p className="text-sm text-primary font-medium">{show.host}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/shows/${show.id}`}>
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(show.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[60px]">
                            {show.description}
                        </p>
                        <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                            <span className="font-semibold">Air Time:</span> {show.airTime}
                        </div>
                    </div>
                ))}
            </div>
            {shows.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No shows found. Add one to get started.
                </div>
            )}
        </div>
    );
}
