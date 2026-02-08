import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground w-full py-6 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                    <p>&copy; {new Date().getFullYear()} CASF | Central Valley Community Radio.</p>
                    <p className="text-xs mt-1">Powered by Citrus3 Streaming.</p>
                </div>

                <div className="flex gap-4">
                    <Link href="https://www.facebook.com/CASFradio" className="hover:text-primary transition-colors" aria-label="Facebook">
                        <Facebook size={20} />
                    </Link>
                    <Link href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                        <Instagram size={20} />
                    </Link>
                    <Link href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
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
        </footer>
    );
}
