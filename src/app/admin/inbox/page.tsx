'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SongRequest = {
    id: string;
    artist: string;
    song: string;
    name?: string;
    email?: string;
    dedication?: string;
    show?: string;
    status?: string;
    date: string;
    doneAt?: string;
};

export default function InboxPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Song requests</h1>
                <p className="text-muted-foreground">Songs listeners asked the hosts to play.</p>
            </div>
            <RequestList />
        </div>
    );
}

function requestText(item: SongRequest) {
    return [item.artist, item.song, item.dedication, item.name, item.email].join(' ').toLowerCase();
}

function RequestCard({ item, onDone, onRemove }: {
    item: SongRequest;
    onDone?: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="font-bold text-lg">{item.song}</h3>
                    <p className="text-sm text-muted-foreground">{item.artist}</p>
                    <p className="mt-2 text-sm font-medium">{item.show ? item.show : 'Off the schedule'}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {item.name && <span>{item.name}</span>}
                        {item.email && <a className="hover:text-primary" href={`mailto:${item.email}`}>{item.email}</a>}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.date).toLocaleString()}
                        </span>
                    </div>
                    {item.dedication && <p className="mt-3 text-sm">Dedication: {item.dedication}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {onDone && (
                        <Button size="sm" variant="outline" onClick={() => onDone(item.id)}>
                            <CheckCircle className="w-4 h-4" />
                            Done
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onRemove(item.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function RequestList() {
    const [requests, setRequests] = useState<SongRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/request.php', { credentials: 'same-origin' });
                if (res.ok) {
                    const data = await res.json();
                    setRequests(Array.isArray(data) ? data : []);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const remove = async (id: string) => {
        if (!confirm('Delete this song request?')) return;
        const res = await fetch(`/api/request.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        if (res.ok) {
            setRequests((current) => current.filter((item) => item.id !== id));
        }
    };

    const markDone = async (id: string) => {
        const item = requests.find((entry) => entry.id === id);
        const label = item ? `${item.song} by ${item.artist}` : 'this request';
        if (!confirm(`Mark ${label} done and move it to the archive?`)) return;
        const res = await fetch('/api/request.php', {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'done' }),
        });
        if (res.ok) {
            setRequests((current) => current.map((entry) => (
                entry.id === id ? { ...entry, status: 'done', doneAt: new Date().toISOString() } : entry
            )));
        }
    };

    if (loading) {
        return <div className="h-24 bg-muted animate-pulse rounded-lg" />;
    }

    const open = requests.filter((item) => item.status !== 'done');
    const query = search.trim().toLowerCase();
    const archived = requests.filter((item) => item.status === 'done' && (query === '' || requestText(item).includes(query)));

    return (
        <div className="space-y-10">
            {open.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
                    <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg">No song requests yet</h3>
                    <p className="text-muted-foreground text-sm">Requests submitted on the site will show up here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {open.map((item) => (
                        <RequestCard key={item.id} item={item} onDone={markDone} onRemove={remove} />
                    ))}
                </div>
            )}

            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Archive</h2>
                        <p className="text-sm text-muted-foreground">Finished requests stay here.</p>
                    </div>
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search artist, song, dedication, name, or email"
                        aria-label="Search archived song requests"
                        className="sm:max-w-sm"
                    />
                </div>
                {archived.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {query ? 'No archived requests match that search.' : 'Finished requests will be kept here.'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {archived.map((item) => (
                            <RequestCard key={item.id} item={item} onRemove={remove} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
