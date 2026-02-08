import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
    try {
        const shows = await dataService.getShows();
        return NextResponse.json(shows);
    } catch (error) {
        console.error('Error fetching shows:', error);
        return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
    }
}
