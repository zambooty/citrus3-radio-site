// Types
export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    body: string;
    date: string;
}

export interface ScheduleItem {
    time: string;
    title: string;
    host: string;
    showId?: string;
}

export interface Track {
    artist: string;
    title: string;
    time?: string;
    image?: string;
}

export interface Show {
    id: string;
    title: string;
    host: string;
    description: string;
    image?: string;
    airTime: string;
}

// API calls using the service layer routes
export const getNews = async (): Promise<NewsItem[]> => {
    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to fetch news');
        return await res.json();
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};

export const getSchedule = async (): Promise<Record<string, ScheduleItem[]>> => {
    try {
        const res = await fetch('/api/schedule');
        if (!res.ok) throw new Error('Failed to fetch schedule');
        return await res.json();
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return {};
    }
};

export const getShows = async (): Promise<Show[]> => {
    try {
        const res = await fetch('/api/shows');
        if (!res.ok) throw new Error('Failed to fetch shows');
        return await res.json();
    } catch (error) {
        console.error("Error fetching shows:", error);
        return [];
    }
};

// Types for the Radio Status API response
interface RadioStatus {
    current: {
        artist: string;
        title: string;
        image: string | null;
        time: string;
    } | null;
    recent: {
        artist: string;
        title: string;
        image: string;
        time: string;
    }[];
}

export const getRadioStatus = async (): Promise<RadioStatus> => {
    try {
        const res = await fetch('/api/radio/status');
        if (!res.ok) throw new Error('Failed to fetch status');
        return await res.json();
    } catch (error) {
        console.error("Error fetching radio status:", error);
        return { current: null, recent: [] };
    }
}

export const submitRequest = async (data: Record<string, string>): Promise<{ success: boolean, message?: string, error?: string }> => {
    try {
        const res = await fetch('/api/radio/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch {
        return { success: false, error: "Network error" };
    }
}

export const getRecentTracks = async (): Promise<Track[]> => {
    const status = await getRadioStatus();
    return status.recent || [];
};

export const getCurrentTrack = async (): Promise<Track | null> => {
    const status = await getRadioStatus();
    return status.current ? {
        artist: status.current.artist,
        title: status.current.title,
        image: status.current.image || undefined,
        time: status.current.time
    } : null;
}

export const getShow = async (slug: string): Promise<Show | null> => {
    try {
        const shows = await getShows();
        return shows.find(s => s.id === slug) || null;
    } catch (error) {
        console.error("Error fetching show:", error);
        return null;
    }
}

export const getNextShow = async (): Promise<ScheduleItem | null> => {
    try {
        const scheduleData = await getSchedule();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const now = new Date();
        const currentDayIndex = now.getDay();
        const currentDay = days[currentDayIndex];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Helper to parse "HH:MM" to minutes
        const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Get today's schedule
        const todaySchedule = scheduleData[currentDay] || [];

        // Find first show after current time
        let nextShow = todaySchedule.find(show => parseTime(show.time) > currentTime);

        // If no more shows today, look at tomorrow
        if (!nextShow) {
            const nextDayIndex = (currentDayIndex + 1) % 7;
            const nextDay = days[nextDayIndex];
            const nextDaySchedule = scheduleData[nextDay] || [];
            nextShow = nextDaySchedule[0];
        }

        return nextShow || null;
    } catch (error) {
        console.error("Error getting next show:", error);
        return null;
    }
}
