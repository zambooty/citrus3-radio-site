"use client";

import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    read: boolean;
}

export function MessageList() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data.sort((a: Message, b: Message) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    if (loading) return <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
    </div>;

    if (messages.length === 0) return (
        <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
            <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No messages yet</h3>
            <p className="text-muted-foreground text-sm">When listeners contact you, they&apos;ll appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        "bg-card rounded-lg border p-6 transition-all",
                        msg.read ? "border-border opacity-75" : "border-primary shadow-sm ring-1 ring-primary/20"
                    )}
                >
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{msg.subject}</h3>
                                {!msg.read && <span className="bg-primary text-primary-foreground text-[10px] uppercase font-black px-1.5 py-0.5 rounded">New</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{msg.name}</span>
                                <a href={`mailto:${msg.email}`} className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">{msg.email}</a>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(msg.date).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!msg.read && (
                                <Button size="sm" variant="outline" onClick={() => markAsRead(msg.id)} title="Mark as read">
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteMessage(msg.id)}
                                title="Delete message"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                    </div>
                </div>
            ))}
        </div>
    );
}
