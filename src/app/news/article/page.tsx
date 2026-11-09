'use client';

import { useEffect, useState } from 'react';
import { getNews, NewsItem } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatNewsDate } from '@/lib/format';

export default function NewsArticlePage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [article, setArticle] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            const news = await getNews();
            const found = news.find(n => n.id === id);
            setArticle(found || null);
            setLoading(false);
        };
        fetchArticle();
    }, [id]);

    if (loading) {
        return <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
        </div>;
    }

    if (!article) {
        return <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <Link href="/news" className="text-primary hover:underline">Return to News</Link>
        </div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <Link href="/news" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to News
                </Link>
                <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">{article.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Calendar className="w-4 h-4" />
                    <time>{formatNewsDate(article.date)}</time>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-foreground/90 bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{article.body}</p>
            </div>
        </div>
    );
}
