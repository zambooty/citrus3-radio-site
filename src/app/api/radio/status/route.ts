import { NextResponse } from 'next/server';
import { fetchArtwork } from '@/services/artworkService';

const BASE_URL = process.env.CENTOVA_API_URL || "http://142.4.215.64:2199/external/rpc.php";
const USERNAME = process.env.CENTOVA_USERNAME || "casf";
const RID = process.env.CENTOVA_RID || "casf";

export async function GET() {
    try {
        // Fetch current song (streaminfo.get)
        const streamInfoRes = await fetch(`${BASE_URL}?m=streaminfo.get&username=${USERNAME}&rid=${RID}&mountpoint=`, {
            next: { revalidate: 10 } // Cache for 10 seconds
        });
        const streamInfoJson = await streamInfoRes.json();

        // Fetch recent tracks (recenttracks.get)
        const recentTracksRes = await fetch(`${BASE_URL}?m=recenttracks.get&username=${USERNAME}&rid=${RID}`, {
            next: { revalidate: 30 }
        });
        const recentTracksJson = await recentTracksRes.json();

        // Transform Data
        const currentData = streamInfoJson?.data?.[0];
        const currentTrack = currentData ? {
            artist: currentData.song.split(' - ')[0] || "Unknown",
            title: currentData.song.split(' - ').slice(1).join(' - ') || currentData.song,
            image: currentData.track?.imageurl || null,
            time: currentData.time
        } : null;

        const historyData = recentTracksJson?.data?.[0] || [];
        const recentTracks = Array.isArray(historyData) ? historyData.map((item: { artist: string; title: string; image: string; time: number }) => ({
            artist: item.artist,
            title: item.title,
            image: item.image,
            time: new Date(item.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })) : [];

        // Enhance current track with better artwork
        if (currentTrack) {
            const artworkResult = await fetchArtwork(
                currentTrack.artist,
                currentTrack.title,
                currentTrack.image
            );

            if (artworkResult.url) {
                currentTrack.image = artworkResult.url;
            }
        }

        // Enhance recent tracks with better artwork (in parallel)
        const enhancedRecentTracks = await Promise.all(
            recentTracks.map(async (track) => {
                const artworkResult = await fetchArtwork(
                    track.artist,
                    track.title,
                    track.image
                );

                return {
                    ...track,
                    image: artworkResult.url || track.image,
                };
            })
        );

        return NextResponse.json({
            current: currentTrack,
            recent: enhancedRecentTracks
        });

    } catch (error) {
        console.error("Error fetching radio status:", error);
        return NextResponse.json({ error: "Failed to fetch radio status" }, { status: 500 });
    }
}
