import { NextResponse } from 'next/server';
import { listenerTracker } from '@/lib/listenerTracker';

export async function GET() {
    try {
        const stats = listenerTracker.getStats();

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
