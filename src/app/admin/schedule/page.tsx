'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';
import { ScheduleItem, Show } from '@/lib/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ScheduleEditor() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({});
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeDay, setActiveDay] = useState('monday');

    const fetchData = useCallback(async () => {
        try {
            const [scheduleRes, showsRes] = await Promise.all([
                fetch('/api/admin/data?file=schedule'),
                fetch('/api/admin/data?file=shows')
            ]);

            if (scheduleRes.ok && showsRes.ok) {
                const sData = await scheduleRes.json();
                const showsData = await showsRes.json();

                // Ensure all days exist
                const normalizedSchedule: Record<string, ScheduleItem[]> = { ...sData };
                DAYS.forEach(day => {
                    if (!normalizedSchedule[day]) normalizedSchedule[day] = [];
                });

                setSchedule(normalizedSchedule);
                setShows(showsData.sort((a: Show, b: Show) => a.title.localeCompare(b.title)));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSlotChange = (day: string, index: number, field: keyof ScheduleItem, value: string) => {
        const newDaySchedule = [...schedule[day]];
        newDaySchedule[index] = { ...newDaySchedule[index], [field]: value };

        // If showId changes, auto-fill details
        if (field === 'showId') {
            const selectedShow = shows.find(s => s.id === value);
            if (selectedShow) {
                newDaySchedule[index].title = selectedShow.title;
                newDaySchedule[index].host = selectedShow.host;
            }
        }

        setSchedule({ ...schedule, [day]: newDaySchedule });
    };

    const addSlot = (day: string) => {
        const newSlot: ScheduleItem = { time: '12:00', title: 'New Slot', host: '', showId: '' };
        setSchedule({ ...schedule, [day]: [...schedule[day], newSlot].sort((a, b) => a.time.localeCompare(b.time)) });
    };

    const removeSlot = (day: string, index: number) => {
        const newDaySchedule = schedule[day].filter((_, i) => i !== index);
        setSchedule({ ...schedule, [day]: newDaySchedule });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Sort times for all days before saving
            const sortedSchedule = { ...schedule };
            DAYS.forEach(day => {
                sortedSchedule[day].sort((a, b) => a.time.localeCompare(b.time));
            });

            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: 'schedule', content: sortedSchedule })
            });

            if (res.ok) {
                router.refresh();
                alert('Schedule saved successfully!');
            } else {
                alert('Failed to save schedule');
            }
        } catch (error) {
            console.error('Save error', error);
            alert('Error saving schedule');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading schedule...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Weekly Schedule</h1>
                    <p className="text-muted-foreground">Manage programming slots for each day.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>

            <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                <TabsList className="grid grid-cols-4 md:grid-cols-7 h-auto">
                    {DAYS.map(day => (
                        <TabsTrigger key={day} value={day} className="capitalize py-2">
                            {day.substring(0, 3)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {DAYS.map(day => (
                    <TabsContent key={day} value={day} className="space-y-4 mt-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold capitalize">{day} Schedule</h2>
                                <Button variant="outline" size="sm" onClick={() => addSlot(day)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Slot
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {schedule[day].length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No shows scheduled for {day}.</p>
                                ) : (
                                    schedule[day].map((slot, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-end bg-secondary/20 p-4 rounded-md border border-border/50">
                                            <div className="col-span-3 md:col-span-2">
                                                <Label className="text-xs mb-1 block">Time (24h)</Label>
                                                <Input
                                                    type="time"
                                                    value={slot.time}
                                                    onChange={(e) => handleSlotChange(day, index, 'time', e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-9 md:col-span-4">
                                                <Label className="text-xs mb-1 block">Show (Link)</Label>
                                                <Select
                                                    value={slot.showId || "custom"}
                                                    onValueChange={(val) => handleSlotChange(day, index, 'showId', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a show..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="custom">-- Custom / Unlinked --</SelectItem>
                                                        {shows.map(s => (
                                                            <SelectItem key={s.id} value={s.id}>
                                                                {s.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="col-span-6 md:col-span-3">
                                                <Label className="text-xs mb-1 block">Title Override</Label>
                                                <Input
                                                    value={slot.title}
                                                    onChange={(e) => handleSlotChange(day, index, 'title', e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-6 md:col-span-2">
                                                <Label className="text-xs mb-1 block">Host Override</Label>
                                                <Input
                                                    value={slot.host}
                                                    onChange={(e) => handleSlotChange(day, index, 'host', e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-12 md:col-span-1 flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeSlot(day, index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
