'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSchedule, getShows, ScheduleItem, Show } from '@/lib/api';
import { Calendar } from 'lucide-react';
import { formatShowTime, minutesFromTime, todayKey } from '@/lib/format';
import { ShowActions } from '@/components/shows/ShareOnFacebook';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({});
    const [shows, setShows] = useState<Record<string, Show>>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('monday');
    const [today, setToday] = useState<string | null>(null);
    const [nowMinutes, setNowMinutes] = useState<number | null>(null);

    useEffect(() => {
        const date = new Date();
        const currentDay = todayKey(date);
        setToday(currentDay);
        setSelectedDay(currentDay);
        setNowMinutes(date.getHours() * 60 + date.getMinutes());

        const fetchSchedule = async () => {
            const [data, roster] = await Promise.all([getSchedule(), getShows()]);
            const byId: Record<string, Show> = {};
            roster.forEach((show) => {
                if (show.id) byId[show.id] = show;
            });
            setShows(byId);
            setSchedule(data);
            setLoading(false);
        };
        fetchSchedule();
    }, []);

    const days = DAY_ORDER.filter((day) => schedule[day]);
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const onNowIndex = (slots: ScheduleItem[]) => {
        let current = -1;
        slots.forEach((slot, index) => {
            if (nowMinutes !== null && minutesFromTime(slot.time) <= nowMinutes) current = index;
        });
        return current;
    };

    if (loading) {
        return <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-12 bg-muted rounded w-64 mx-auto"></div>
            <div className="grid gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg border border-border"></div>
                ))}
            </div>
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    Weekly Schedule
                </h1>
                <p className="text-muted-foreground">Don&apos;t miss your favorite shows. Tune in daily.</p>
            </div>

            {days.length === 0 ? (
                <p className="text-center text-muted-foreground">The schedule is not available right now.</p>
            ) : (
            <div className="grid gap-6">
                <div className="flex flex-wrap justify-center gap-2">
                    {days.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={`px-3 py-2 rounded-full text-sm font-medium capitalize transition-colors ${selectedDay === day ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                            {day.slice(0, 3)}
                            {day === today ? ' · today' : ''}
                        </button>
                    ))}
                </div>
                {days.filter((day) => day === selectedDay).map((day) => {
                    const isToday = day === today;
                    const liveIndex = isToday ? onNowIndex(schedule[day]) : -1;
                    return (
                    <div key={day} className={`bg-card text-card-foreground rounded-lg border overflow-hidden ${isToday ? 'border-primary shadow-sm' : 'border-border'}`}>
                        <div className="bg-secondary/50 p-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">{capitalize(day)}</h2>
                            {isToday && <span className="text-xs font-bold uppercase tracking-wider text-primary">Today</span>}
                        </div>
                        <div className="p-4">
                            {schedule[day].length > 0 ? (
                                <ul className="space-y-4">
                                    {schedule[day].map((show, i) => {
                                        const live = i === liveIndex;
                                        const profile = show.showId && show.showId !== 'custom' ? shows[show.showId] : undefined;
                                        const linked = Boolean(profile);
                                        return (
                                        <li key={`${show.time}-${show.title}`} className={`flex gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0 ${live ? 'bg-primary/5 -mx-2 px-2 py-2 rounded-md' : ''}`}>
                                            {profile?.image && (
                                                <Link href={`/programs/show?id=${show.showId}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                                    <Image src={profile.image} alt="" fill className="object-cover" />
                                                </Link>
                                            )}
                                            <div className="flex flex-1 flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 min-w-0">
                                                <time className="font-medium text-primary w-24 shrink-0">{formatShowTime(show.time)}</time>
                                                <div className="flex-1 min-w-0">
                                                    <strong className="block text-lg">
                                                        {linked ? (
                                                            <Link href={`/programs/show?id=${show.showId}`} className="hover:text-primary">
                                                                {show.title}
                                                            </Link>
                                                        ) : show.title}
                                                    </strong>
                                                    <span className="text-sm text-muted-foreground">Host: {profile?.host || show.host}</span>
                                                    {profile?.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{profile.description}</p>
                                                    )}
                                                    {profile && (
                                                        <div className="mt-2">
                                                            <ShowActions
                                                                compact
                                                                id={profile.id}
                                                                title={profile.title}
                                                                host={profile.host}
                                                                airTime={profile.airTime || formatShowTime(show.time)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {live && <span className="text-xs font-bold uppercase tracking-wider text-red-600 shrink-0">On now</span>}
                                            </div>
                                        </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">No scheduled programming. Automated music rotation.</p>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
            )}
        </div>
    );
}
