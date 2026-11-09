'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Show } from '@/lib/api';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

function ShowEditor() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || 'new';
    const isNew = id === 'new';
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Show>({
        id: '',
        title: '',
        host: '',
        description: '',
        airTime: '',
        image: '/images/default-show.jpg'
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch('/api/upload.php', {
                method: 'POST',
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({ ...prev, image: data.url }));
                } else {
                    alert(data.error || 'Upload failed');
                }
            } else {
                alert('Server error during upload');
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    const fetchShow = useCallback(async () => {
        try {
            const res = await fetch('/api/data.php?file=shows');
            if (res.ok) {
                const shows: Show[] = await res.json();
                const item = shows.find(s => s.id === id);
                if (item) {
                    setFormData(item);
                } else {
                    alert('Show not found');
                    router.push('/admin/shows');
                }
            }
        } catch (error) {
            console.error('Error fetching show', error);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (!isNew) {
            fetchShow();
        }
    }, [isNew, fetchShow]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/data.php?file=shows');
            if (!res.ok) throw new Error('Failed to fetch existing data');

            let showsList: Show[] = await res.json();

            if (isNew) {
                const newId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const newItem = { ...formData, id: newId || `show-${Date.now()}` };
                showsList.push(newItem);
            } else {
                showsList = showsList.map(item => item.id === id ? formData : item);
            }

            const saveRes = await fetch('/api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'shows', content: showsList })
            });

            if (saveRes.ok) {
                router.push('/admin/shows');
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
                    <Link href="/admin/shows">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isNew ? 'New Show' : 'Edit Show'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border border-border rounded-lg shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Show Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Morning Coffee"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="host">Host Name</Label>
                        <Input
                            id="host"
                            name="host"
                            value={formData.host}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Sarah J."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="airTime">Air Time (Display Text)</Label>
                    <Input
                        id="airTime"
                        name="airTime"
                        value={formData.airTime}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Mon-Fri at 8:00 AM"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe the show..."
                        rows={5}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Image Path</Label>
                    <div className="flex gap-2">
                        <Input
                            id="image"
                            name="image"
                            value={formData.image || ''}
                            onChange={handleChange}
                            placeholder="/images/shows/default.jpg"
                            className="flex-1"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload a photo from your computer, or paste a link.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/shows">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Show'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function ShowEditorPage() {
    return (
        <Suspense fallback={<div>Loading editor...</div>}>
            <ShowEditor />
        </Suspense>
    );
}
