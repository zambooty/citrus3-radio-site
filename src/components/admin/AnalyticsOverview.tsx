"use client";

import { useEffect, useState } from 'react';
import { Users, Globe, Clock, Smartphone } from 'lucide-react';

interface ListenerStats {
    currentListeners: number;
    geographic: Record<string, number>;
    devices: Record<string, number>;
    averageDuration: number;
    peakListeners: number;
    peakTime?: number;
}

export function AnalyticsOverview() {
    const [stats, setStats] = useState<ListenerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/analytics/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Refresh every 10s
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

    const topCountries = Object.entries(stats.geographic)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const deviceStats = Object.entries(stats.devices);

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
                        <h3 className="text-sm font-medium text-muted-foreground">Avg. Duration</h3>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{formatDuration(stats.averageDuration)}</p>
                </div>

                {/* Countries */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Countries</h3>
                        <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{Object.keys(stats.geographic).length}</p>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Geographic Distribution */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Top Countries
                    </h3>
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
                                                    width: `${(count / stats.currentListeners) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No active listeners</p>
                    )}
                </div>

                {/* Device Distribution */}
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Devices
                    </h3>
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
                                                    width: `${(count / stats.currentListeners) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No active listeners</p>
                    )}
                </div>
            </div>
        </div>
    );
}
