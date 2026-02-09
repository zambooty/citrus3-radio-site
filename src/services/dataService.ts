import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

async function readJsonFile<T>(filename: string): Promise<T> {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}

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

export interface Show {
    id: string;
    title: string;
    host: string;
    description: string;
    image?: string;
    airTime: string;
}

export const dataService = {
    async getNews(): Promise<NewsItem[]> {
        return readJsonFile<NewsItem[]>('news.json');
    },

    async getSchedule(): Promise<Record<string, ScheduleItem[]>> {
        return readJsonFile<Record<string, ScheduleItem[]>>('schedule.json');
    },

    async getShows(): Promise<Show[]> {
        return readJsonFile<Show[]>('shows.json');
    },

    async getShowById(id: string): Promise<Show | null> {
        const shows = await this.getShows();
        return shows.find(s => s.id === id) || null;
    },

    async getNextShow(): Promise<ScheduleItem | null> {
        try {
            const scheduleData = await this.getSchedule();
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
};
