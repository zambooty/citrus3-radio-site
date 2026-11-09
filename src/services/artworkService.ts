import { artworkCache } from '@/lib/artworkCache';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function downloadAndSaveArtwork(url: string, artist: string, track: string): Promise<string | null> {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const artworksDir = path.join(publicDir, 'artworks');
        
        // Create directory if it doesn't exist
        await fs.mkdir(artworksDir, { recursive: true });

        // Generate safe filename
        const safeArtist = artist.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeTrack = track.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
        const filename = `${safeArtist}-${safeTrack}-${hash}.jpg`;
        const localPath = path.join(artworksDir, filename);
        const publicUrl = `/artworks/${filename}`;

        // Check if file already exists
        try {
            await fs.access(localPath);
            return publicUrl; // File exists, return cached path
        } catch {
            // File doesn't exist, proceed to download
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(localPath, buffer);
        
        return publicUrl;
    } catch (error) {
        console.error('Error saving artwork locally:', error);
        return null; // Fallback to original URL if saving fails
    }
}
// Normalize text for better API matching
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' '); // Normalize whitespace
}

// iTunes Search API
async function fetchFromItunes(artist: string, track: string): Promise<string | null> {
    try {
        const query = encodeURIComponent(`${artist} ${track}`);
        const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=5`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Try to find best match
            const normalizedArtist = normalizeText(artist);
            const normalizedTrack = normalizeText(track);

            for (const result of data.results) {
                const resultArtist = normalizeText(result.artistName || '');
                const resultTrack = normalizeText(result.trackName || '');

                // Check for reasonable match
                if (resultArtist.includes(normalizedArtist) || normalizedArtist.includes(resultArtist)) {
                    if (resultTrack.includes(normalizedTrack) || normalizedTrack.includes(resultTrack)) {
                        // Get high-res artwork (replace 100x100 with 600x600)
                        const artworkUrl = result.artworkUrl100?.replace('100x100', '600x600');
                        if (artworkUrl) return artworkUrl;
                    }
                }
            }

            // If no exact match, return first result's artwork
            const artworkUrl = data.results[0].artworkUrl100?.replace('100x100', '600x600');
            return artworkUrl || null;
        }

        return null;
    } catch (error) {
        console.error('iTunes API error:', error);
        return null;
    }
}

// Deezer API
async function fetchFromDeezer(artist: string, track: string): Promise<string | null> {
    try {
        const query = encodeURIComponent(`artist:"${artist}" track:"${track}"`);
        const url = `https://api.deezer.com/search?q=${query}&limit=5`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            // Try to find best match
            const normalizedArtist = normalizeText(artist);
            const normalizedTrack = normalizeText(track);

            for (const result of data.data) {
                const resultArtist = normalizeText(result.artist?.name || '');
                const resultTrack = normalizeText(result.title || '');

                if (resultArtist.includes(normalizedArtist) || normalizedArtist.includes(resultArtist)) {
                    if (resultTrack.includes(normalizedTrack) || normalizedTrack.includes(resultTrack)) {
                        // Get high-res artwork
                        const artworkUrl = result.album?.cover_big || result.album?.cover_medium;
                        if (artworkUrl) return artworkUrl;
                    }
                }
            }

            // If no exact match, return first result
            const artworkUrl = data.data[0].album?.cover_big || data.data[0].album?.cover_medium;
            return artworkUrl || null;
        }

        return null;
    } catch (error) {
        console.error('Deezer API error:', error);
        return null;
    }
}

// MusicBrainz + Cover Art Archive (two-step process)
async function fetchFromMusicBrainz(artist: string, track: string): Promise<string | null> {
    try {
        // Step 1: Search MusicBrainz for recording
        const query = encodeURIComponent(`artist:"${artist}" AND recording:"${track}"`);
        const searchUrl = `https://musicbrainz.org/ws/2/recording?query=${query}&fmt=json&limit=5`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(searchUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'RadioStation/1.0 (contact@example.com)', // MusicBrainz requires User-Agent
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.recordings && data.recordings.length > 0) {
            // Try to get release ID from first recording
            for (const recording of data.recordings) {
                if (recording.releases && recording.releases.length > 0) {
                    const releaseId = recording.releases[0].id;

                    // Step 2: Fetch cover art from Cover Art Archive
                    const coverUrl = `https://coverartarchive.org/release/${releaseId}/front`;

                    try {
                        const coverResponse = await fetch(coverUrl, { 
                            method: 'HEAD',
                            signal: controller.signal 
                        });
                        if (coverResponse.ok) {
                            return coverUrl;
                        }
                    } catch {
                        continue;
                    }
                }
            }
        }

        return null;
    } catch {
        // MusicBrainz can be flaky, silently fail and let other sources handle it
        return null;
    }
}

export interface ArtworkResult {
    url: string | null;
    source: 'cache' | 'itunes' | 'deezer' | 'musicbrainz' | 'fallback' | 'none';
}

export async function fetchArtwork(
    artist: string,
    track: string,
    fallbackUrl?: string | null
): Promise<ArtworkResult> {
    // Check cache first
    const cached = artworkCache.get(artist, track);
    if (cached) {
        return { url: cached, source: 'cache' };
    }

    // Try APIs in parallel for speed
    const results = await Promise.allSettled([
        fetchFromItunes(artist, track),
        fetchFromDeezer(artist, track),
        fetchFromMusicBrainz(artist, track),
    ]);

    // Check iTunes first (usually best quality)
    let finalUrl = null;
    let source = 'none';

    if (results[0].status === 'fulfilled' && results[0].value) {
        finalUrl = results[0].value;
        source = 'itunes';
    } else if (results[1].status === 'fulfilled' && results[1].value) {
        finalUrl = results[1].value;
        source = 'deezer';
    } else if (results[2].status === 'fulfilled' && results[2].value) {
        finalUrl = results[2].value;
        source = 'musicbrainz';
    }

    if (finalUrl) {
        // Download and save locally
        const localUrl = await downloadAndSaveArtwork(finalUrl, artist, track);
        const savedUrl = localUrl || finalUrl; // fallback to external URL if save fails
        artworkCache.set(artist, track, savedUrl, source);
        return { url: savedUrl, source: source as any };
    }

    // Use fallback if provided and not "nocover"
    if (fallbackUrl && !fallbackUrl.includes('nocover')) {
        const localUrl = await downloadAndSaveArtwork(fallbackUrl, artist, track);
        const savedUrl = localUrl || fallbackUrl;
        artworkCache.set(artist, track, savedUrl, 'fallback');
        return { url: savedUrl, source: 'fallback' };
    }

    return { url: null, source: 'none' };
}
