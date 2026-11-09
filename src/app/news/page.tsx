'use client';

import { useState, useEffect } from 'react';
import { getNews, NewsItem } from '@/lib/api';
import { Newspaper, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatNewsDate } from '@/lib/format';

export default function NewsPage() {
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

    if (loading) {
        return <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="h-12 bg-muted rounded w-64 mx-auto"></div>
            <div className="space-y-8">
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-muted rounded-lg border border-border"></div>
                ))}
            </div>
        </div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Newspaper className="w-8 h-8 text-primary" />
                    Station News
                </h1>
                <p className="text-muted-foreground">Latest updates from your community station.</p>
            </div>

            <div className="space-y-8">
                {news.map((item) => (
                    <article key={item.id} className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border transition-all hover:shadow-md hover:border-primary/20">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">
                                <Link href={`/news/article?id=${item.id}`}>{item.title}</Link>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <Calendar className="w-4 h-4" />
                                <time>{formatNewsDate(item.date)}</time>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-foreground/90">
                            <p className="line-clamp-3">{item.summary}</p>
                        </div>
                        
                        <div className="mt-6">
                            <Link href={`/news/article?id=${item.id}`} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                                Read more <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </article>
                ))}
                {news.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No news posts yet. Check back soon!
                    </div>
                )}
            </div>
        </div>
    );
}
