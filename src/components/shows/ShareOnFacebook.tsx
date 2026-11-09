'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook } from 'lucide-react';
import { showShareText } from '@/lib/shareText';

type ShareShow = {
    id: string;
    title: string;
    host?: string;
    airTime?: string;
    compact?: boolean;
    className?: string;
};

export function showShareUrl(id: string) {
    return `https://casfradio.ca/programs/show/?id=${encodeURIComponent(id)}`;
}

export function showPagePath(id: string) {
    return `/programs/show?id=${encodeURIComponent(id)}`;
}

export { showShareText };

function buttonClass(compact: boolean, className = '') {
    return `${compact
        ? 'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'
        : 'inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'} ${className}`;
}

export function FacebookShareButton({ title, text, href, compact = false, className = '' }: {
    title: string;
    text: string;
    href: string;
    compact?: boolean;
    className?: string;
}) {
    const [notice, setNotice] = useState('');
    const [caption, setCaption] = useState('');

    function share() {
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();

        navigator.clipboard.writeText(text).then(() => {
            setCaption('');
            setNotice('Post copied. Paste it into the Facebook box.');
        }).catch(() => {
            setCaption(text);
            setNotice('Copy this post into the Facebook box.');
        });
        window.setTimeout(() => setNotice(''), 8000);
    }

    return (
        <div className={`${compact ? 'inline-flex items-start' : 'flex'} flex-col gap-1 ${className}`}>
            <button
                type="button"
                onClick={share}
                aria-label={`Share ${title} on Facebook`}
                className={buttonClass(compact, className.includes('w-full') ? 'w-full' : '')}
            >
                <Facebook className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                Share{compact ? '' : ' on Facebook'}
            </button>
            {notice && (
                <p className="max-w-xs text-xs text-muted-foreground" role="status">{notice}</p>
            )}
            {caption && (
                <p className="max-w-xs select-all text-xs text-foreground">{caption}</p>
            )}
        </div>
    );
}

export function ShareOnFacebook({ id, title, host, airTime, compact = false, className = '' }: ShareShow) {
    const text = showShareText({ title, host, airTime });
    const href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(showShareUrl(id))}&quote=${encodeURIComponent(text)}`;
    return <FacebookShareButton title={title} text={text} href={href} compact={compact} className={className} />;
}

export function MoreDetails({ id, title, compact = false, className = '' }: Pick<ShareShow, 'id' | 'title' | 'compact' | 'className'>) {
    return (
        <Link
            href={showPagePath(id)}
            aria-label={`More details about ${title}`}
            className={buttonClass(compact, className)}
        >
            More details
        </Link>
    );
}

export function ShowActions({ id, title, host, airTime, compact = false, className = '' }: ShareShow) {
    return (
        <div className={`flex flex-wrap items-start gap-2 ${className}`}>
            <ShareOnFacebook
                id={id}
                title={title}
                host={host}
                airTime={airTime}
                compact={compact}
            />
            <MoreDetails id={id} title={title} compact={compact} />
        </div>
    );
}
