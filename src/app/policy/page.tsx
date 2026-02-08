import { Shield, FileText, Lock } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy & Terms - CASF Radio',
    description: 'Privacy Policy and Terms of Service for CASF Central Valley Community Radio.',
};

export default function PolicyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Privacy & Terms</h1>
                <p className="text-xl text-muted-foreground">Legal information and listener protections.</p>
            </div>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <Shield className="w-6 h-6" />
                    <h2>Privacy Policy</h2>
                </div>
                <div className="prose dark:prose-invert max-w-none space-y-4 text-foreground/90">
                    <p>
                        At CASF Radio, we are committed to protecting your privacy. This policy outlines how we handle any information
                        collected through our website and streaming services.
                    </p>

                    <h3 className="text-lg font-bold">Information Collection</h3>
                    <p>
                        We do not collect personal identification information unless you voluntarily provide it (e.g., when submitting
                        a song request or contacting us). Standard analytical data (IP addresses, browser types) may be collected
                        anonymously to improve our website performance.
                    </p>

                    <h3 className="text-lg font-bold">Cookies</h3>
                    <p>
                        Our website may use cookies to enhance user experience. You can choose to set your web browser to refuse cookies,
                        though some parts of the site may not function properly as a result.
                    </p>

                    <h3 className="text-lg font-bold">Third-Party Services</h3>
                    <p>
                        We use Citrus3 for our radio streaming. While we do not share your personal data with them, their service
                        may have its own privacy policies regarding stream listeners.
                    </p>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <FileText className="w-6 h-6" />
                    <h2>Terms of Service</h2>
                </div>
                <div className="prose dark:prose-invert max-w-none space-y-4 text-foreground/90">
                    <p>
                        By using the CASF website and listening to our broadcast, you agree to the following terms:
                    </p>

                    <h3 className="text-lg font-bold">Content Usage</h3>
                    <p>
                        The content on this website, including logos and text, is property of CASF Radio unless otherwise stated.
                        Music broadcast is licensed appropriately through relevant performance rights organizations.
                    </p>

                    <h3 className="text-lg font-bold">Code of Conduct</h3>
                    <p>
                        Listeners and users interacting with our station (via requests or comments) are expected to remain respectful.
                        We reserve the right to ignore or block requests that are offensive or inappropriate.
                    </p>
                </div>
            </section>

            <section className="bg-muted p-8 rounded-lg space-y-4 border border-border">
                <div className="flex items-center gap-2 text-lg font-bold">
                    <Lock className="w-5 h-5" />
                    <h3>Data Security</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    We implement appropriate data collection, storage, and processing practices and security measures to protect
                    against unauthorized access, alteration, disclosure, or destruction of your personal information.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                    Last Updated: {new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </section>
        </div>
    );
}
