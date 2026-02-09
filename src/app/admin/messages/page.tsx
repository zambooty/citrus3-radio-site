import { auth } from "@/auth";
import { MessageList } from "@/components/admin/MessageList";
import { Mail } from "lucide-react";

export default async function AdminMessages() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Mail className="w-8 h-8 text-primary" />
                        Inbound Messages
                    </h1>
                    <p className="text-muted-foreground">Manage communications from your listeners.</p>
                </div>
            </div>

            <MessageList />
        </div>
    );
}
