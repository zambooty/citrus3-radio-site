'use client';

import { useEffect, useRef, useState } from 'react';

const PAGE_URL = 'https://www.facebook.com/CASFradio';
const FEED_HEIGHT = 500;

function pluginSrc(width: number) {
    const params = new URLSearchParams({
        href: PAGE_URL,
        show_posts: 'true',
        width: String(width),
        height: String(FEED_HEIGHT),
        small_header: 'true',
        adapt_container_width: 'false',
        hide_cover: 'true',
        show_facepile: 'false',
    });

    return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}

export function FacebookFeed() {
    const frameRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const [width, setWidth] = useState<number | null>(null);
    const [blocked, setBlocked] = useState(false);

    useEffect(() => {
        const el = frameRef.current;
        if (!el) return;

        const update = () => {
            const next = Math.round(Math.max(180, Math.min(420, el.clientWidth)));
            setWidth((current) => (current !== null && Math.abs(current - next) < 12 ? current : next));
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (width === null) return;
        loadedRef.current = false;
        setBlocked(false);
        const timer = window.setTimeout(() => {
            if (!loadedRef.current) setBlocked(true);
        }, 8000);
        return () => window.clearTimeout(timer);
    }, [width]);

    return (
        <div ref={frameRef} className="w-full max-w-[420px] shrink-0 mx-auto lg:mx-0">
            <div
                className="overflow-hidden rounded-xl border border-border bg-white shadow-2xl shadow-black/40"
                style={{ height: FEED_HEIGHT }}
            >
                {width === null || blocked ? (
                    <a
                        href={PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
                    >
                        <span className="text-base font-semibold text-[#1877F2]">CASF Radio on Facebook</span>
                        <span className="text-sm text-stone-600">Open the page to see the latest posts.</span>
                    </a>
                ) : (
                    <iframe
                        title="CASF Radio Facebook feed"
                        src={pluginSrc(width)}
                        width={width}
                        height={FEED_HEIGHT}
                        className="block h-full w-full bg-white"
                        style={{ border: 'none', overflow: 'hidden' }}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        onLoad={() => {
                            loadedRef.current = true;
                            setBlocked(false);
                        }}
                        onError={() => setBlocked(true)}
                    />
                )}
            </div>
            <a
                href={PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-sm font-medium text-foreground hover:text-[#1877F2]"
            >
                Open CASF on Facebook
            </a>
        </div>
    );
}
