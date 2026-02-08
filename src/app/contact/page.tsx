import { ContactForm } from '@/components/contact/ContactForm';
import { MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
    title: 'Contact Us - CASF Radio',
    description: 'Get in touch with CASF Central Valley Community Radio.',
};

export default function ContactPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Get in Touch</h1>
                <p className="text-xl text-muted-foreground italic">We love hearing from our listeners!</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2">
                    <ContactForm />
                </div>

                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2">Station Info</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        [Station Address]<br />
                                        Central Valley, NS
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">Phone</p>
                                    <p className="text-sm text-muted-foreground">902-680-2403</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        <a href="mailto:dfineberg@eastlink.ca" className="hover:underline">dfineberg@eastlink.ca</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-secondary/20 p-6 rounded-lg space-y-3">
                        <h3 className="font-bold">Dave Fineberg</h3>
                        <p className="text-sm text-muted-foreground italic">Station Management</p>
                        <p className="text-xs text-muted-foreground">
                            For press inquiries, licensing questions, or community partnership opportunities.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
