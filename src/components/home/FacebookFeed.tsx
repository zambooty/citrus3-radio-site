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
    const [width, setWidth] = useState<number | null>(null);

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

    return (
        <div ref={frameRef} className="w-full max-w-[420px] shrink-0 mx-auto lg:mx-0">
            <div
                className="overflow-hidden rounded-xl border border-border bg-white shadow-2xl shadow-black/40"
                style={{ height: FEED_HEIGHT }}
            >
                {width === null ? (
                    <a
                        href={PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-[#1877F2]"
                    >
                        Follow CASF Radio on Facebook
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
                    />
                )}
            </div>
        </div>
    );
}
