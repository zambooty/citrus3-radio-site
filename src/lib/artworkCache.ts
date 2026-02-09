// Simple in-memory cache for album artwork URLs
// TTL: 24 hours, LRU eviction when max size reached

interface CacheEntry {
    url: string;
    source: string;
    timestamp: number;
}

class ArtworkCache {
    private cache: Map<string, CacheEntry>;
    private readonly maxSize: number;
    private readonly ttl: number; // milliseconds

    constructor(maxSize = 500, ttlHours = 24) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttlHours * 60 * 60 * 1000;
    }

    private generateKey(artist: string, track: string): string {
        return `${artist.toLowerCase().trim()}|${track.toLowerCase().trim()}`;
    }

    get(artist: string, track: string): string | null {
        const key = this.generateKey(artist, track);
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        const now = Date.now();
        if (now - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (LRU)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.url;
    }

    set(artist: string, track: string, url: string, source: string): void {
        const key = this.generateKey(artist, track);

        // Evict oldest if at max size
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            url,
            source,
            timestamp: Date.now(),
        });
    }

    clear(): void {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttlHours: this.ttl / (60 * 60 * 1000),
        };
    }
}

// Singleton instance
export const artworkCache = new ArtworkCache();
