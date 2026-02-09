import { NextResponse } from 'next/server';
import { messageService } from '@/services/messageService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Save to local JSON file
        const savedMessage = await messageService.saveMessage({
            name,
            email,
            subject,
            message
        });

        console.log("Contact form submission saved:", savedMessage.id);

        return NextResponse.json({
            success: true,
            message: "Thank you for your message. We will get back to you soon."
        });

    } catch (error) {
        console.error("Error processing contact form:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
