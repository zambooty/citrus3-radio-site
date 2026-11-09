'use client';

import { useEffect, useState } from 'react';
import { Clock, Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from '@/components/admin/MessageList';

type SongRequest = {
    id: string;
    artist: string;
    song: string;
    name?: string;
    email?: string;
    dedication?: string;
    date: string;
};

export default function InboxPage() {
    const [tab, setTab] = useState<'messages' | 'requests'>('messages');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground">Contact messages and song requests from listeners.</p>
            </div>
            <div className="flex gap-2">
                <Button variant={tab === 'messages' ? 'default' : 'outline'} onClick={() => setTab('messages')}>
                    Messages
                </Button>
                <Button variant={tab === 'requests' ? 'default' : 'outline'} onClick={() => setTab('requests')}>
                    Song requests
                </Button>
            </div>
            {tab === 'messages' ? <MessageList /> : <RequestList />}
        </div>
    );
}

function RequestList() {
    const [requests, setRequests] = useState<SongRequest[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="h-24 bg-muted animate-pulse rounded-lg" />;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
                <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No song requests yet</h3>
                <p className="text-muted-foreground text-sm">Requests submitted on the site will show up here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((item) => (
                <div key={item.id} className="bg-card rounded-lg border border-border p-6">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="font-bold text-lg">{item.song}</h3>
                            <p className="text-sm text-muted-foreground">{item.artist}</p>
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
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(item.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
