import { dataService } from '@/services/dataService';
import { Newspaper, Calendar } from 'lucide-react';

export const revalidate = 60;

export default async function NewsPage() {
    const news = await dataService.getNews();

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
                    <article key={item.id} className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-2">
                                {item.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <time>{new Date(item.date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</time>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-foreground/90">
                            <p>{item.body}</p>
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
