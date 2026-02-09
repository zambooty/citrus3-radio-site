import { artworkCache } from '@/lib/artworkCache';

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
                        const coverResponse = await fetch(coverUrl, { method: 'HEAD' });
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
    if (results[0].status === 'fulfilled' && results[0].value) {
        const url = results[0].value;
        artworkCache.set(artist, track, url, 'itunes');
        return { url, source: 'itunes' };
    }

    // Check Deezer
    if (results[1].status === 'fulfilled' && results[1].value) {
        const url = results[1].value;
        artworkCache.set(artist, track, url, 'deezer');
        return { url, source: 'deezer' };
    }

    // Check MusicBrainz
    if (results[2].status === 'fulfilled' && results[2].value) {
        const url = results[2].value;
        artworkCache.set(artist, track, url, 'musicbrainz');
        return { url, source: 'musicbrainz' };
    }

    // Use fallback if provided and not "nocover"
    if (fallbackUrl && !fallbackUrl.includes('nocover')) {
        artworkCache.set(artist, track, fallbackUrl, 'fallback');
        return { url: fallbackUrl, source: 'fallback' };
    }

    return { url: null, source: 'none' };
}
