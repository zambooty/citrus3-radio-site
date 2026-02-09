import crypto from 'crypto';

// Privacy-focused listener session tracking
interface ListenerSession {
    id: string;
    ipHash: string; // hashed for privacy
    country?: string;
    city?: string;
    userAgent: string;
    device: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    connectedAt: number;
    lastPing: number;
    duration: number; // in seconds
}

interface ListenerStats {
    currentListeners: number;
    sessions: ListenerSession[];
    geographic: Record<string, number>; // country -> count
    devices: Record<string, number>; // device type -> count
    averageDuration: number; // in seconds
    peakListeners: number;
    peakTime?: number;
}

class ListenerTracker {
    private sessions: Map<string, ListenerSession>;
    private peakListeners: number;
    private peakTime?: number;
    private readonly sessionTimeout = 60000; // 60 seconds

    constructor() {
        this.sessions = new Map();
        this.peakListeners = 0;

        // Clean up stale sessions every 30 seconds
        setInterval(() => this.cleanupStaleSessions(), 30000);
    }

    private hashIP(ip: string): string {
        return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    }

    private detectDevice(userAgent: string): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
        const ua = userAgent.toLowerCase();
        if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
        if (/tablet|ipad/.test(ua)) return 'tablet';
        if (/windows|mac|linux/.test(ua)) return 'desktop';
        return 'unknown';
    }

    private cleanupStaleSessions(): void {
        const now = Date.now();
        for (const [id, session] of this.sessions.entries()) {
            if (now - session.lastPing > this.sessionTimeout) {
                this.sessions.delete(id);
            }
        }
    }

    connect(sessionId: string, ip: string, userAgent: string, country?: string, city?: string): void {
        const now = Date.now();
        const ipHash = this.hashIP(ip);

        const session: ListenerSession = {
            id: sessionId,
            ipHash,
            country,
            city,
            userAgent,
            device: this.detectDevice(userAgent),
            connectedAt: now,
            lastPing: now,
            duration: 0,
        };

        this.sessions.set(sessionId, session);

        // Update peak
        if (this.sessions.size > this.peakListeners) {
            this.peakListeners = this.sessions.size;
            this.peakTime = now;
        }
    }

    ping(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            const now = Date.now();
            session.lastPing = now;
            session.duration = Math.floor((now - session.connectedAt) / 1000);
        }
    }

    disconnect(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    getStats(): ListenerStats {
        this.cleanupStaleSessions();

        const sessions = Array.from(this.sessions.values());
        const geographic: Record<string, number> = {};
        const devices: Record<string, number> = {};
        let totalDuration = 0;

        for (const session of sessions) {
            // Geographic distribution
            if (session.country) {
                geographic[session.country] = (geographic[session.country] || 0) + 1;
            }

            // Device distribution
            devices[session.device] = (devices[session.device] || 0) + 1;

            // Total duration
            totalDuration += session.duration;
        }

        const averageDuration = sessions.length > 0 ? Math.floor(totalDuration / sessions.length) : 0;

        return {
            currentListeners: sessions.length,
            sessions,
            geographic,
            devices,
            averageDuration,
            peakListeners: this.peakListeners,
            peakTime: this.peakTime,
        };
    }

    // Get detailed session info (for admin view)
    getSessions(): ListenerSession[] {
        this.cleanupStaleSessions();
        return Array.from(this.sessions.values());
    }

    // Reset peak stats (useful for daily/weekly resets)
    resetPeak(): void {
        this.peakListeners = this.sessions.size;
        this.peakTime = Date.now();
    }
}

// Singleton instance
export const listenerTracker = new ListenerTracker();
