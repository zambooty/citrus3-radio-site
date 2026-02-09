"use client";

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Menu, X } from 'lucide-react';

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/news', label: 'News' },
        { href: '/request', label: 'Request Song' },
        { href: '/about', label: 'About' },
    ];

    return (
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition-opacity">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 bg-white">
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
                            className="text-foreground/80 hover:text-primary transition-colors font-medium"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {/* CTA Button could go here */}
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 -mr-2 text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-lg font-medium py-2 hover:text-primary transition-colors border-b border-border/50 last:border-0"
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
