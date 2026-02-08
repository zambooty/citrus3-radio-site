import { SongRequestForm } from '@/components/requests/SongRequestForm';

export const metadata = {
    title: 'Request a Song - Community Radio',
    description: 'Submit your song requests and dedications to our live DJs.',
};

export default function RequestPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Request a Song</h1>
                <p className="text-muted-foreground">Tell us what you want to hear!</p>
            </div>
            <SongRequestForm />
        </div>
    );
}
