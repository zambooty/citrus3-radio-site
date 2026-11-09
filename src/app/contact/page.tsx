import { MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
    title: 'Contact Us - CASF Radio',
    description: 'Get in touch with CASF Central Valley Community Radio.',
};

export default function ContactPage() {
    return (
        <div className="max-w-xl mx-auto space-y-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Get in Touch</h1>
                <p className="text-xl text-muted-foreground italic">We love hearing from our listeners!</p>
            </div>

            <div className="mx-auto max-w-sm space-y-8 text-center">
                <section className="space-y-6">
                    <h2 className="text-xl font-bold">Station Info</h2>
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <MapPin className="mx-auto h-5 w-5 text-primary" />
                            <p className="font-semibold">Address</p>
                            <p className="text-sm text-muted-foreground">Central Valley, Nova Scotia</p>
                        </div>
                        <div className="space-y-1">
                            <Phone className="mx-auto h-5 w-5 text-primary" />
                            <p className="font-semibold">Phone</p>
                            <p className="text-sm text-muted-foreground">
                                <a href="tel:+19026802403" className="hover:underline">902-680-2403</a>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Mail className="mx-auto h-5 w-5 text-primary" />
                            <p className="font-semibold">Email</p>
                            <p className="text-sm text-muted-foreground">
                                <a href="mailto:casfinfo18@gmail.com" className="hover:underline">casfinfo18@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-lg bg-secondary/20 p-6 space-y-2">
                    <h3 className="font-bold">Dave Fineberg</h3>
                    <p className="text-sm text-muted-foreground italic">Station Management</p>
                    <p className="text-xs text-muted-foreground">
                        For press inquiries, licensing questions, or community partnership opportunities.
                    </p>
                </section>
            </div>
        </div>
    );
}
