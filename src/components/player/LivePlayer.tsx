"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Ensure utils is imported

export function LivePlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // 0.0 to 1.0
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<{ artist: string; title: string } | null>(null);

    // Poll for current track
    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const track = await import('@/lib/api').then(m => m.getCurrentTrack());
                if (track) {
                    setCurrentTrack({ artist: track.artist, title: track.title });
                }
            } catch (e) {
                console.error("Failed to fetch current track", e);
            }
        };

        fetchTrack();
        const interval = setInterval(fetchTrack, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Placeholder stream URL - User must update this
    const STREAM_URL = "http://142.4.215.64:8184/stream";

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            setError(null);
            // Reset source to ensure live edge
            const currentSrc = audioRef.current.src;
            audioRef.current.src = "";
            audioRef.current.src = currentSrc;

            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Playback failed:", err);
                    setIsLoading(false);
                    setIsPlaying(false);
                    setError("Stream unavailable");
                });
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
            <div className="container mx-auto flex items-center justify-between gap-4">

                {/* Play/Pause Control */}
                <div className="flex items-center gap-4">
                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-md"
                        onClick={togglePlay}
                        disabled={!!error && !isPlaying} // Allow trying again if error but logic might need reset
                        aria-label={isPlaying ? "Pause" : "Play Live Radio"}
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                        ) : isPlaying ? (
                            <Pause className="h-6 w-6" fill="currentColor" />
                        ) : (
                            <Play className="h-6 w-6 ml-1" fill="currentColor" />
                        )}
                    </Button>

                    <span className="font-bold text-sm md:text-base flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", isPlaying ? "bg-red-500 animate-pulse" : "bg-gray-400")} />
                        {error ? "Offline" : isPlaying ? "On Air Now" : "Live Radio"}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground hidden md:inline-block">
                            {error ? "Stream connection failed" : currentTrack ? (
                                <span className="animate-in fade-in slide-in-from-bottom-1 duration-500 block max-w-[200px] md:max-w-xs truncate">
                                    <span className="font-semibold text-primary">{currentTrack.title}</span>
                                    <span className="mx-1">•</span>
                                    {currentTrack.artist}
                                </span>
                            ) : "CASF | Central Valley Community Radio"}
                        </span>
                    </div>
                </div>


                {/* Error Message */}
                {error && (
                    <div className="hidden md:flex items-center text-destructive text-sm gap-1">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Volume Control */}
                <div className="flex items-center gap-2 w-24 md:w-32">
                    <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        aria-label="Volume"
                    />
                </div>

                <audio
                    ref={audioRef}
                    src={STREAM_URL}
                    onError={() => {
                        setError("Stream offline");
                        setIsPlaying(false);
                        setIsLoading(false);
                    }}
                    preload="none"
                />
            </div>
        </div>
    );
}
