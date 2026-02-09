import Link from 'next/link';
import NextImage from 'next/image';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground w-full py-6 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 overflow-hidden rounded-full border border-primary/20 bg-muted">
                        <NextImage
                            src="/images/logo.png"
                            alt="CASF Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-foreground">CASF | Central Valley</p>
                        <p>&copy; {new Date().getFullYear()} Community Radio.</p>
                        <p className="text-xs mt-0.5 opacity-70">Powered by Citrus3 Streaming.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link href="https://www.facebook.com/CASFradio" className="hover:text-primary transition-colors" aria-label="Facebook">
                        <Facebook size={20} />
                    </Link>
                    <Link href="https://www.instagram.com/casfradio" className="hover:text-primary transition-colors" aria-label="Instagram">
                        <Instagram size={20} />
                    </Link>
                    <Link href="https://x.com/casfradio" className="hover:text-primary transition-colors" aria-label="Twitter">
                        <Twitter size={20} />
                    </Link>
                    <Link href="mailto:dfineberg@eastlink.ca" className="hover:text-primary transition-colors" aria-label="Email">
                        <Mail size={20} />
                    </Link>
                </div>

                <nav className="flex gap-4 text-sm">
                    <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                    <Link href="/policy" className="hover:text-foreground transition-colors">Privacy</Link>
                </nav>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity">
                    This website was made by <span className="text-primary">McKale Jonas</span>
                </p>
            </div>
        </footer>
    );
}
