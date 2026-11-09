"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumArtworkProps {
    src?: string | null;
    alt: string;
    size?: number;
    className?: string;
    artist?: string;
    trackTitle?: string;
    onArtistFound?: (artist: string) => void;
}

export function AlbumArtwork({ src, alt, size = 40, className, artist, trackTitle, onArtistFound }: AlbumArtworkProps) {
    const [fetchedArtwork, setFetchedArtwork] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [prevSrc, setPrevSrc] = useState(src);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setFetchedArtwork(null);
        setHasError(false);
        setIsLoading(true);
    }

    const currentSrc = fetchedArtwork || src;
    const isNocover = (url: string | null | undefined) => url?.includes('nocover.png');
    const shouldShowFallback = !currentSrc || hasError || isNocover(currentSrc);

    // Fetch dynamic artwork if it's the fallback, or if we need to discover the artist
    useEffect(() => {
        if ((shouldShowFallback || artist === 'Unknown' || !artist) && trackTitle) {
            const fetchDynamicArtwork = async () => {
                try {
                    const params = new URLSearchParams({ artist: artist || 'Unknown', track: trackTitle });
                    if (src && !isNocover(src)) {
                        params.append('fallback', src);
                    }
                    const res = await fetch(`/api/artwork.php?${params.toString()}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.url && !isNocover(data.url)) {
                            setFetchedArtwork(data.url);
                            setHasError(false);
                            setIsLoading(true);
                        }
                        if (data.artist && onArtistFound) {
                            onArtistFound(data.artist);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch dynamic artwork:", error);
                }
            };
            fetchDynamicArtwork();
        }
    }, [shouldShowFallback, artist, trackTitle, src, onArtistFound]);

    const sizeClass = size === 48 ? 'w-12 h-12' : size === 40 ? 'w-10 h-10' : `w-[${size}px] h-[${size}px]`;

    if (shouldShowFallback) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-secondary rounded-md text-muted-foreground shrink-0",
                    sizeClass,
                    className
                )}>
                <Disc size={size * 0.5} />
            </div>
        );
    }

    return (
        <div
            className={cn("relative shrink-0 overflow-hidden rounded-md bg-secondary", sizeClass, className)}
        >
            {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-secondary" />
            )}
            <Image
                src={currentSrc as string}
                alt={alt}
                width={size}
                height={size}
                className={cn(
                    "object-cover transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                    sizeClass
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
                unoptimized // External images from radio API
            />
        </div>
    );
}
