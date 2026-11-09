"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { getNews, type NewsItem } from '@/lib/api';
import { formatNewsDate } from '@/lib/format';

export function NewsPreview() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const data = await getNews();
            setNews([...data].sort((a, b) => b.date.localeCompare(a.date)));
            setLoading(false);
        };
        fetchNews();
    }, []);

    return (
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    Station News
                </h2>
                <Link
                    href="/news"
                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                >
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {news.slice(0, 3).map((item) => (
                        <article key={item.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                <Link href={`/news/article?id=${item.id}`}>{item.title}</Link>
                            </h3>
                            <time className="text-xs text-muted-foreground block mb-2">
                                {formatNewsDate(item.date)}
                            </time>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                                {item.summary}
                            </p>
                        </article>
                    ))}
                    {news.length === 0 && (
                        <p className="text-muted-foreground text-sm">No news updates at the moment.</p>
                    )}
                </div>
            )}
        </div>
    );
}
