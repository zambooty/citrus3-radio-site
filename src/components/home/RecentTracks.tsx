"use client";

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getRecentTracks, type Track } from '@/lib/api';
import { AlbumArtwork } from '@/components/ui/AlbumArtwork';

export function RecentTracks() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = () => {
            getRecentTracks().then(data => {
                setTracks(data);
                setLoading(false);
            });
        };

        fetchTracks();
        const interval = setInterval(fetchTracks, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recently Played
            </h2>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-secondary animate-pulse rounded-md" />
                    ))}
                </div>
            ) : (
                <ul className="space-y-3">
                    {tracks.map((track, i) => (
                        <li key={i} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-md transition-colors group">
                            <AlbumArtwork
                                src={track.image}
                                alt={`${track.title} by ${track.artist}`}
                                size={40}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{track.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{track.time}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
