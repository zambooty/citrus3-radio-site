'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook } from 'lucide-react';

type ShareShow = {
    id: string;
    title: string;
    description?: string;
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

function closeSentence(lead: string) {
    const text = lead.trim();
    return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function showShareText(show: Omit<ShareShow, 'compact' | 'id' | 'className'>) {
    const title = show.title.trim();
    const when = show.airTime?.trim();
    const host = show.host?.trim();
    const withHost = host ? ` with ${host}` : '';

    if (when) {
        return `${closeSentence(`${title} is on ${when}${withHost}`)} Come listen with us. Put it on, settle in, and enjoy the show on CASF Radio.`;
    }

    if (host) {
        return `${title} with ${host} is on CASF Radio. Come listen with us. Put it on, settle in, and enjoy the show.`;
    }

    return `${title} is on CASF Radio. Come listen with us. Put it on, settle in, and enjoy the show.`;
}

function buttonClass(compact: boolean, className = '') {
    return `${compact
        ? 'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'
        : 'inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'} ${className}`;
}

export function ShareOnFacebook({ id, title, description, host, airTime, compact = false, className = '' }: ShareShow) {
    const text = showShareText({ title, description, host, airTime });
    const href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(showShareUrl(id))}&quote=${encodeURIComponent(text)}`;
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

export function ShowActions({ id, title, description, host, airTime, compact = false, className = '' }: ShareShow) {
    return (
        <div className={`flex flex-wrap items-start gap-2 ${className}`}>
            <ShareOnFacebook
                id={id}
                title={title}
                description={description}
                host={host}
                airTime={airTime}
                compact={compact}
            />
            <MoreDetails id={id} title={title} compact={compact} />
        </div>
    );
}
