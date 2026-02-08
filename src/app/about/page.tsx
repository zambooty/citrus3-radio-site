import { Heart, Shield } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">About CASF</h1>
                <p className="text-xl text-muted-foreground">Central Valley Community Radio</p>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <Heart className="w-6 h-6" />
                    <h2>Our Mission</h2>
                </div>
                <p className="text-lg leading-relaxed text-foreground/90">
                    We are a nonprofit, community-first radio station dedicated to amplifying local voices and bringing neighbors together.
                    We believe in the power of conversation, the joy of diverse music, and the importance of accessible, trustworthy local news.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-card p-6 rounded-lg border border-border space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Community Focused</h3>
                    <p className="text-muted-foreground">
                        From highlighting local events to featuring neighborhood artists, everything we do is rooted in the place we call home.
                    </p>
                </section>

                <section className="bg-card p-6 rounded-lg border border-border space-y-3">
                    <h3 className="text-xl font-bold text-foreground">Listener Supported</h3>
                    <p className="text-muted-foreground">
                        As a nonprofit, we rely on the generosity of our listeners. No corporate interests—just pure, unadulterated community radio.
                    </p>
                </section>
            </div>

            <section className="bg-secondary/30 p-8 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-lg font-bold">
                    <Shield className="w-5 h-5" />
                    <h3>Licensing & Rights</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    CASF operates under a license from the Federal Communications Commission (FCC) [or appropriate local usage].
                    All music broadcast is licensed appropriately. Station management is responsible for all programming and content compliance.
                </p>
                <div className="text-sm text-muted-foreground mt-4 space-y-1">
                    <p className="font-bold">Contact:</p>
                    <p>Dave Fineberg</p>
                    <p>Email: <a href="mailto:dfineberg@eastlink.ca" className="hover:underline text-primary">dfineberg@eastlink.ca</a></p>
                    <p>Tel: 902-680-2403</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                    &copy; {new Date().getFullYear()} CASF | Central Valley Community Radio.
                </p>
            </section>
        </div>
    );
}
