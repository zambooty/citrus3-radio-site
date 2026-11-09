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

export function showShareText(show: Omit<ShareShow, 'compact' | 'id'>) {
    const when = [show.airTime, show.host ? `with ${show.host}` : ''].filter(Boolean).join(' ');
    const lines = [show.title, when, show.description?.trim()].filter(Boolean);
    return lines.join('\n\n');
}

export function ShareOnFacebook({ id, title, description, host, airTime, compact = false, className = '' }: ShareShow) {
    const href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(showShareUrl(id))}&quote=${encodeURIComponent(showShareText({ title, description, host, airTime }))}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share ${title} on Facebook`}
            className={`${compact
                ? 'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'
                : 'inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-[#1877F2] hover:text-[#1877F2]'} ${className}`}
        >
            <Facebook className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            Share{compact ? '' : ' on Facebook'}
        </a>
    );
}
