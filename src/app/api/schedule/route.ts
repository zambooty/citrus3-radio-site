import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
    try {
        const schedule = await dataService.getSchedule();
        return NextResponse.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}
