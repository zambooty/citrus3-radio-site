import { getShow } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Mic, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ShowPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const show = await getShow(slug);

    if (!show) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-video md:aspect-[3/1] flex items-center justify-center border border-border">
                {/* Placeholder for show image */}
                <div className="text-center p-6">
                    <Mic className="w-16 h-16 mx-auto text-primary/40 mb-4" />
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        {show.title}
                    </h1>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">About the Show</h2>
                        <div className="prose dark:prose-invert">
                            <p>{show.description}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-bold mb-2">Previous Episodes</h3>
                        <p className="text-muted-foreground text-sm">No archived episodes available yet.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-secondary/30 p-6 rounded-lg border border-border">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Air Time
                        </h3>
                        <p className="font-medium">{show.airTime}</p>
                        <p className="text-sm text-muted-foreground mt-1">Live on 105.5 FM</p>

                        <div className="mt-6 pt-6 border-t border-border/50">
                            <h4 className="font-bold mb-2">Hosted By</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="font-bold text-primary">{show.host.charAt(0)}</span>
                                </div>
                                <span>{show.host}</span>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full" asChild>
                        <Link href="/schedule">View Full Schedule</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
