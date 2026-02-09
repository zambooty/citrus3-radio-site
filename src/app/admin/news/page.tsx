'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, User, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewsItem } from '@/lib/api';
import Link from 'next/link';

export default function NewsAdmin() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('list');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/admin/data?file=news');
            if (res.ok) {
                const data = await res.json();
                setNews(data);
            }
        } catch {
            console.error('Failed to fetch news');
        } finally {
            setLoading(false);
        }
    };

    const deleteNewsItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const newList = news.filter(item => item.id !== id);
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'news', content: newList })
            });

            if (res.ok) {
                setNews(newList);
            }
        } catch {
            alert('Failed to delete article');
        }
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded-md w-1/4" />
        <div className="grid grid-cols-1 gap-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
        </div>
    </div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
                    <p className="text-muted-foreground">Create and manage community news articles.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/news/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Article
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 border border-border rounded-md p-1">
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setView('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setView('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {filteredNews.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">No articles found matching your search.</p>
                </div>
            ) : view === 'list' ? (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredNews.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono whitespace-nowrap">{item.date}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{item.title}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/news/${item.id}`}>
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteNewsItem(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item) => (
                        <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Calendar className="w-3 h-3" />
                                    {item.date}
                                </div>
                                <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3">{item.summary}</p>
                            </div>
                            <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/news/${item.id}`}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteNewsItem(item.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
