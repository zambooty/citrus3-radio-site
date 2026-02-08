"use client";

import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { type NewsItem } from '@/lib/api';

export function NewsPreview({ news }: { news: NewsItem[] }) {
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

            <div className="space-y-4">
                {news.slice(0, 3).map((item) => (
                    <article key={item.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            <Link href={`/news`}>{item.title}</Link> {/* In real app, /news/[slug] */}
                        </h3>
                        <time className="text-xs text-muted-foreground block mb-2">
                            {new Date(item.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
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
        </div>
    );
}
