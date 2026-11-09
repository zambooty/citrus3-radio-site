import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shows - CASF Radio',
    description: 'Programs on CASF Community Radio, with hosts, air times, descriptions, and pictures.',
};

export default function ShowsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
