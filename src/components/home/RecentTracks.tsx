"use client";

import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { getRecentTracks, type Track } from '@/lib/api';
import { AlbumArtwork } from '@/components/ui/AlbumArtwork';

export function RecentTracks() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const discoveredArtistsRef = useRef<Record<string, string>>({});

    useEffect(() => {
        const fetchTracks = async () => {
            const data = await getRecentTracks();
            
            const enrichedData = await Promise.all(data.map(async (track) => {
                let finalArtist = track.artist;
                
                if (finalArtist === 'Unknown' && discoveredArtistsRef.current[track.title]) {
                    finalArtist = discoveredArtistsRef.current[track.title];
                }
                
                if (finalArtist === 'Unknown' && track.title) {
                    try {
                        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(track.title)}&entity=song&limit=1`;
                        const res = await fetch(searchUrl);
                        if (res.ok) {
                            const itunesData = await res.json();
                            if (itunesData.results && itunesData.results.length > 0) {
                                finalArtist = itunesData.results[0].artistName;
                                discoveredArtistsRef.current[track.title] = finalArtist;
                            }
                        }
                    } catch (e) {
                        console.debug('Client-side iTunes fetch failed', e);
                    }
                }
                
                return { ...track, artist: finalArtist };
            }));
            
            setTracks(enrichedData);
            setLoading(false);
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
            ) : tracks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing in the recent playlist yet.</p>
            ) : (
                <ul className="space-y-3">
                    {tracks.map((track, i) => (
                        <li key={i} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-md transition-colors group">
                            <AlbumArtwork
                                src={track.image}
                                alt={`${track.title} by ${track.artist}`}
                                size={40}
                                artist={track.artist}
                                trackTitle={track.title}
                                onArtistFound={(realArtist) => {
                                    if (track.artist === 'Unknown' || !track.artist) {
                                        discoveredArtistsRef.current[track.title] = realArtist;
                                        setTracks(prev => {
                                            const newTracks = [...prev];
                                            newTracks[i] = { ...newTracks[i], artist: realArtist };
                                            return newTracks;
                                        });
                                    }
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{track.title}</p>
                                {track.artist && (
                                    <p className="text-sm text-muted-foreground truncate">
                                        {track.artist === 'Unknown' ? 'Unknown Artist' : track.artist}
                                    </p>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{track.time}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
