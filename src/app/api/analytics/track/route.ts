import { NextRequest, NextResponse } from 'next/server';
import { listenerTracker } from '@/lib/listenerTracker';

// Extract geographic info from request headers (Vercel, Cloudflare, etc.)
function getGeoData(request: NextRequest) {
    // Vercel headers
    const country = request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') || // Cloudflare
        undefined;

    const city = request.headers.get('x-vercel-ip-city') || undefined;

    return { country, city };
}

// Get client IP (with proxy support)
function getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const ip = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const { country, city } = getGeoData(request);

        switch (event) {
            case 'connect':
                listenerTracker.connect(sessionId, ip, userAgent, country, city);
                break;

            case 'ping':
                listenerTracker.ping(sessionId);
                break;

            case 'disconnect':
                listenerTracker.disconnect(sessionId);
                break;

            default:
                return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
