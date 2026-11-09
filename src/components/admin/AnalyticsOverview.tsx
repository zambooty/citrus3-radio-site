"use client";

import { useEffect, useState } from 'react';
import { Users, Globe, Clock, Smartphone } from 'lucide-react';

interface ListenerStats {
    currentListeners: number;
    streamListeners?: number | null;
    websiteListeners?: number;
    listenerSource?: 'stream' | 'website';
    geographic: Record<string, number>;
    devices: Record<string, number>;
    averageDuration: number;
    peakListeners: number;
    peakTime?: number | null;
}

export function AnalyticsOverview() {
    const [stats, setStats] = useState<ListenerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                let connections: number | null = null;
                try {
                    const streamRes = await fetch('https://s3.citrus3.com:2000/json/stream/casf', { cache: 'no-store' });
                    if (streamRes.ok) {
                        const stream = await streamRes.json();
                        if (typeof stream?.connections === 'number') {
                            connections = stream.connections;
                        }
                    }
                } catch {
                    connections = null;
                }

                const res = await fetch('/api/analytics/stats.php', {
                    method: connections === null ? 'GET' : 'POST',
                    credentials: 'same-origin',
                    cache: 'no-store',
                    headers: connections === null ? undefined : { 'Content-Type': 'application/json' },
                    body: connections === null ? undefined : JSON.stringify({ connections }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (connections !== null) {
                        data.currentListeners = connections;
                        data.streamListeners = connections;
                        data.listenerSource = 'stream';
                        data.peakListeners = Math.max(Number(data.peakListeners) || 0, connections);
                    }
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card p-6 rounded-lg border border-border shadow-sm animate-pulse">
                        <div className="h-4 bg-secondary rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-secondary rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                Failed to load analytics data
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const topCountries = Object.entries(stats.geographic || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const deviceStats = Object.entries(stats.devices || {});
    const websiteListeners = stats.websiteListeners ?? 0;
    const share = (count: number) => websiteListeners > 0 ? Math.min(100, (count / websiteListeners) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Current Listeners */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Live Listeners</h3>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">{stats.currentListeners}</p>
                        {stats.currentListeners > 0 && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.listenerSource === 'stream'
                            ? `${websiteListeners} on this website`
                            : 'Stream count unavailable. Showing website players.'}
                    </p>
                </div>

                {/* Peak Listeners */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Peak Today</h3>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.peakListeners}</p>
                    {stats.peakTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(stats.peakTime).toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* Average Duration */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Avg. listen today</h3>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{formatDuration(stats.averageDuration)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Website player</p>
                </div>

                {/* Countries */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Countries</h3>
                        <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{Object.keys(stats.geographic || {}).length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Website players</p>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Geographic Distribution */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Top Countries
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">People listening in the website player.</p>
                    {topCountries.length > 0 ? (
                        <div className="space-y-3">
                            {topCountries.map(([country, count]) => (
                                <div key={country} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{country || 'Unknown'}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${share(count)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No website players right now</p>
                    )}
                </div>

                {/* Device Distribution */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Devices
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">People listening in the website player.</p>
                    {deviceStats.length > 0 ? (
                        <div className="space-y-3">
                            {deviceStats.map(([device, count]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <span className="text-sm font-medium capitalize">{device}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${share(count)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No website players right now</p>
                    )}
                </div>
            </div>
        </div>
    );
}
