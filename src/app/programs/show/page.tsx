'use client';

import { useEffect, useState } from 'react';
import { getShow, Show } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Mic, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShareOnFacebook } from '@/components/shows/ShareOnFacebook';
import Image from 'next/image';

export default function ShowPage() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('id');
    const [show, setShow] = useState<Show | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShow = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }
            const data = await getShow(slug);
            setShow(data || null);
            setLoading(false);
        };
        fetchShow();
    }, [slug]);

    if (loading) {
        return <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="aspect-video bg-muted rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
            </div>
        </div>;
    }

    if (!show) {
        return <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Show Not Found</h1>
            <Link href="/schedule" className="text-primary hover:underline">Return to Schedule</Link>
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-video md:aspect-[3/1] flex items-center justify-center border border-border group">
                {show.image ? (
                    <>
                        <Image src={show.image} alt={show.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <div className="relative z-20 text-center p-6 text-white">
                            <h1 className="text-4xl md:text-5xl font-black drop-shadow-md">
                                {show.title}
                            </h1>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6">
                        <Mic className="w-16 h-16 mx-auto text-primary/40 mb-4" />
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                            {show.title}
                        </h1>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">About the Show</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>{show.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-secondary/30 p-6 rounded-lg border border-border">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Air Time
                        </h3>
                        <p className="font-medium">{show.airTime}</p>
                        <p className="text-sm text-muted-foreground mt-1">Streaming live at casfradio.ca</p>

                        <div className="mt-6 pt-6 border-t border-border/50">
                            <h4 className="font-bold mb-2">Hosted By</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="font-bold text-primary">{show.host.charAt(0)}</span>
                                </div>
                                <span>{show.host}</span>
                            </div>
                        </div>
                    </div>

                    <ShareOnFacebook
                        className="w-full"
                        id={show.id}
                        title={show.title}
                        description={show.description}
                        host={show.host}
                        airTime={show.airTime}
                    />

                    <Button className="w-full" asChild>
                        <Link href="/schedule">View Full Schedule</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
