import { NextResponse } from 'next/server';

export async function GET() {
    const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || "http://142.4.215.64:8184/stream";

    try {
        const response = await fetch(streamUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch stream: ${response.statusText}`);
        }

        // Create a ReadableStream from the response body
        const stream = response.body;

        if (!stream) {
            throw new Error('No stream body received');
        }

        // Return the stream as a response with appropriate headers
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Stream proxy error:', error);
        return NextResponse.json({ error: 'Failed to proxy stream' }, { status: 500 });
    }
}
