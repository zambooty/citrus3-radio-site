'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NewsItem } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewsEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isNew = id === 'new';
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<NewsItem>({
        id: '',
        title: '',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        summary: '',
        body: ''
    });

    const fetchNewsItem = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/data?file=news');
            if (res.ok) {
                const news: NewsItem[] = await res.json();
                const item = news.find(n => n.id === id);
                if (item) {
                    setFormData(item);
                } else {
                    alert('News item not found');
                    router.push('/admin/news');
                }
            }
        } catch (error) {
            console.error('Error fetching news', error);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (!isNew) {
            fetchNewsItem();
        }
    }, [isNew, fetchNewsItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/admin/data?file=news');
            if (!res.ok) throw new Error('Failed to fetch existing data');

            let newsList: NewsItem[] = await res.json();

            if (isNew) {
                const newId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const newItem = { ...formData, id: newId || `news-${Date.now()}` };
                newsList.push(newItem);
            } else {
                newsList = newsList.map(item => item.id === id ? formData : item);
            }

            const saveRes = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'news', content: newsList })
            });

            if (saveRes.ok) {
                router.push('/admin/news');
                router.refresh();
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            console.error('Save error', error);
            alert('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading editor...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/news">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isNew ? 'Create News' : 'Edit News'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border border-border rounded-lg shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Summer Festival Lineup"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                        id="summary"
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        required
                        placeholder="Brief overview for the card preview..."
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="body">Content</Label>
                    <Textarea
                        id="body"
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        required
                        placeholder="Full article content..."
                        className="min-h-[200px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/news">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
