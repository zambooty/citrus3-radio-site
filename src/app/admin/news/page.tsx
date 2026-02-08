'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { NewsItem } from '@/lib/api';

export default function AdminNewsList() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/admin/data?file=news');
            if (res.ok) {
                const data = await res.json();
                // Sort by date descending
                data.sort((a: NewsItem, b: NewsItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setNews(data);
            }
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;

        const updatedNews = news.filter(item => item.id !== id);

        try {
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'news', content: updatedNews })
            });

            if (res.ok) {
                setNews(updatedNews);
                router.refresh(); // Refresh server components if any
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            alert('Error deleting item');
        }
    };

    if (loading) return <div>Loading news...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">News Updates</h1>
                    <p className="text-muted-foreground">Manage station news and announcements.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/news/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add News
                    </Link>
                </Button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Summary</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {news.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-medium">{item.title}</td>
                                <td className="px-4 py-3 max-w-md truncate text-muted-foreground">
                                    {item.summary}
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/admin/news/${item.id}`}>
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {news.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No news items found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
