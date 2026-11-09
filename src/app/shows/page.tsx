'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Mic, User } from 'lucide-react';
import { getShows, Show } from '@/lib/api';
import { ShowActions } from '@/components/shows/ShareOnFacebook';

export default function ShowsPage() {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getShows();
            setShows(data.filter((show) => show.title));
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                <div className="h-12 bg-muted rounded w-64 mx-auto" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-80 bg-muted rounded-xl border border-border" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Mic className="w-8 h-8 text-primary" />
                    Shows
                </h1>
                <p className="text-muted-foreground">Pictures, hosts, and descriptions for the programs on CASF.</p>
            </div>

            {shows.length === 0 ? (
                <p className="text-center text-muted-foreground">No shows are published yet.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shows.map((show) => (
                        <article
                            key={show.id}
                            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col group hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <Link href={`/programs/show?id=${show.id}`} className="flex flex-1 flex-col">
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                    {show.image ? (
                                        <Image
                                            src={show.image}
                                            alt={show.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                            <Mic className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 space-y-3">
                                    <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{show.title}</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-primary shrink-0" />
                                        <span>{show.host}</span>
                                    </div>
                                    {show.airTime && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 shrink-0" />
                                            <span>{show.airTime}</span>
                                        </div>
                                    )}
                                    {show.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3">{show.description}</p>
                                    )}
                                </div>
                            </Link>
                            <div className="px-5 pb-5">
                                <ShowActions
                                    id={show.id}
                                    title={show.title}
                                    host={show.host}
                                    airTime={show.airTime}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
