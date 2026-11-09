"use client";

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FacebookFeed } from '@/components/home/FacebookFeed';
import { getNextShow, type ScheduleItem } from '@/lib/api';
import { formatShowTime } from '@/lib/format';
import { useState, useEffect } from 'react';

export function Hero() {
    const [nextShow, setNextShow] = useState<ScheduleItem | null>(null);

    useEffect(() => {
        getNextShow().then(setNextShow).catch(console.error);
    }, []);

    return (
        <section className="relative overflow-hidden rounded-2xl mb-8 border border-border min-h-[450px] flex items-center">
            {/* Background Image - Timeless Studio */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105 bg-[url('/images/hero_timeless.png')]"
            />
            {/* Sophisticated Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/60 to-transparent" />

            <div className="relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-8 p-6 md:p-10 lg:p-12 text-center lg:text-left">
                <div className="max-w-xl space-y-6">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-red-600/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Live on AIR
                        </div>

                        {nextShow && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-foreground text-sm font-semibold border border-border shadow-sm">
                                <Calendar className="w-3 h-3 text-primary" />
                                Up Next: {nextShow.title} at {formatShowTime(nextShow.time)}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight drop-shadow-sm">
                            Real People. <br />
                            <span className="text-primary underline decoration-primary/20 underline-offset-8">Real Stories.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                            Join us for local news, diverse talk shows, and hand-picked tunes. We are the voice of the Central Valley, streaming online from Nova Scotia.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                        <Button
                            size="lg"
                            className="rounded-full text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                            onClick={() => window.dispatchEvent(new Event('casf-play'))}
                        >
                            Listen Live
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full text-base font-bold bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all hover:-translate-y-0.5" asChild>
                            <Link href="/request">Song Request</Link>
                        </Button>
                    </div>
                </div>
                <FacebookFeed />
            </div>
        </section>
    );
}
