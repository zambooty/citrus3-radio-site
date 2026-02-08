import { getSchedule } from '@/lib/api';
import { Calendar } from 'lucide-react';

export const revalidate = 60;

export default async function SchedulePage() {
    const schedule = await getSchedule();
    const days = Object.keys(schedule);

    // Basic capitalization helper
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    Weekly Schedule
                </h1>
                <p className="text-muted-foreground">Don&apos;t miss your favorite shows. Tune in daily.</p>
            </div>

            <div className="grid gap-6">
                {days.map((day) => (
                    <div key={day} className="bg-card text-card-foreground rounded-lg border border-border overflow-hidden">
                        <div className="bg-secondary/50 p-4 border-b border-border">
                            <h2 className="font-bold text-lg">{capitalize(day)}</h2>
                        </div>
                        <div className="p-4">
                            {schedule[day].length > 0 ? (
                                <ul className="space-y-4">
                                    {schedule[day].map((show, i) => (
                                        <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                                            <time className="font-mono font-medium text-primary w-24 shrink-0">{show.time}</time>
                                            <div className="flex-1">
                                                <strong className="block text-lg">{show.title}</strong>
                                                <span className="text-sm text-muted-foreground">Host: {show.host}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No scheduled programming. Automated music rotation.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
