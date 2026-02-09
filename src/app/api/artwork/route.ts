import { NextRequest, NextResponse } from 'next/server';
import { fetchArtwork } from '@/services/artworkService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artist = searchParams.get('artist');
        const track = searchParams.get('track');
        const fallback = searchParams.get('fallback');

        if (!artist || !track) {
            return NextResponse.json(
                { error: 'Missing artist or track parameter' },
                { status: 400 }
            );
        }

        const result = await fetchArtwork(artist, track, fallback);

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24h cache, 48h stale
            },
        });
    } catch (error) {
        console.error('Artwork API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch artwork' },
            { status: 500 }
        );
    }
}
