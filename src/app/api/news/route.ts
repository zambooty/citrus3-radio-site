import { NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function GET() {
    try {
        const news = await dataService.getNews();
        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
