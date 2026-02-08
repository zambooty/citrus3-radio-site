import { Radio, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getNextShow } from '@/lib/api';

export async function Hero() {
    const nextShow = await getNextShow();

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-8 md:p-12 mb-8 border border-border">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="max-w-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live on 105.5 FM & Online
                        </div>

                        {nextShow && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                                <Calendar className="w-3 h-3" />
                                Up Next: {nextShow.time} - {nextShow.title}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                        Welcome to <span className="text-primary">CASF</span>
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Real people, real stories, real music. We are the voice of the neighborhood, bringing you local news, diverse talk shows, and hand-picked tunes every day.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        <Button size="lg" className="rounded-full text-base" asChild>
                            {/* This button just scrolls to player or could trigger play, but we'll link to schedule for now as "Listen Live" is sticky */}
                            <Link href="/schedule">View Schedule</Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
                            <Link href="/request">Request a Song</Link>
                        </Button>
                    </div>
                </div>

                <div className="hidden md:block opacity-10 md:opacity-100 transition-opacity">
                    <Radio className="w-48 h-48 text-primary/20" />
                </div>
            </div>
        </section>
    );
}
