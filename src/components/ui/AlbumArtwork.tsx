"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumArtworkProps {
    src?: string | null;
    alt: string;
    size?: number;
    className?: string;
}

export function AlbumArtwork({ src, alt, size = 40, className }: AlbumArtworkProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if image is missing or is the "nocover" placeholder
    const shouldShowFallback = !src || hasError || src.includes('nocover.png');

    if (shouldShowFallback) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-secondary rounded-md text-muted-foreground shrink-0",
                    className
                )}
                style={{ width: size, height: size }}
            >
                <Disc size={size * 0.5} />
            </div>
        );
    }

    return (
        <div
            className={cn("relative shrink-0 overflow-hidden rounded-md bg-secondary", className)}
            style={{ width: size, height: size }}
        >
            {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-secondary" />
            )}
            <Image
                src={src}
                alt={alt}
                width={size}
                height={size}
                className={cn(
                    "object-cover transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
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
