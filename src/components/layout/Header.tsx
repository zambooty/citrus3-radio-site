"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NextImage from 'next/image';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname() || '/';

    const isActive = (href: string) => {
        const current = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        if (href === '/') return current === '/';
        return current === href || current.startsWith(`${href}/`);
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/shows', label: 'Shows' },
        { href: '/news', label: 'News' },
        { href: '/request', label: 'Request Song' },
        { href: '/about', label: 'About' },
    ];

    return (
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition-opacity">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 bg-muted">
                        <NextImage
                            src="/images/logo.png"
                            alt="CASF Radio Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-primary tracking-tight">CASF</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Radio Station</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors font-medium ${isActive(link.href) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pl-4 border-l border-border h-6 flex items-center">
                        <ThemeToggle />
                    </div>
                </nav>

                {/* Mobile Icons */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-2 -mr-2 text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-lg font-medium py-4 transition-colors border-b border-border/50 last:border-0 ${isActive(link.href) ? 'text-primary' : 'hover:text-primary'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
