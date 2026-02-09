'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Clock, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Show } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function ShowsAdmin() {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchShows();
    }, []);

    const fetchShows = async () => {
        try {
            const res = await fetch('/api/admin/data?file=shows');
            if (res.ok) {
                const data = await res.json();
                setShows(data);
            }
        } catch {
            console.error('Failed to fetch shows');
        } finally {
            setLoading(false);
        }
    };

    const deleteShow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this show? This will NOT remove it from the schedule automagically.')) return;

        try {
            const newList = shows.filter(item => item.id !== id);
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'shows', content: newList })
            });

            if (res.ok) {
                setShows(newList);
            }
        } catch {
            alert('Failed to delete show');
        }
    };

    const filteredShows = shows.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.host.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
        </div>
    </div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shows Management</h1>
                    <p className="text-muted-foreground">Manage the roster of on-air programs and hosts.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/shows/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Show
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shows or hosts..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 border border-border rounded-md p-1">
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setView('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setView('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {filteredShows.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">No shows found matching your search.</p>
                </div>
            ) : view === 'list' ? (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Show</th>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Host</th>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Air Time</th>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredShows.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold">{item.title}</td>
                                    <td className="px-6 py-4 text-sm">{item.host}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.airTime}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/shows/${item.id}`}>
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteShow(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShows.map((item) => (
                        <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col group">
                            <div className="aspect-video relative overflow-hidden bg-muted">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                        <LayoutGrid className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <h3 className="text-white font-bold text-lg line-clamp-1">{item.title}</h3>
                                </div>
                            </div>
                            <div className="p-5 flex-1 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{item.host}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.airTime}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            </div>
                            <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/shows/${item.id}`}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteShow(item.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
