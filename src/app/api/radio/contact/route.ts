import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // In a real application, you would send an email or save to a database here.
        console.log("Contact form submission:", { name, email, subject, message });

        // Simulate success
        return NextResponse.json({ success: true, message: "Thank you for your message. We will get back to you soon." });

    } catch (error) {
        console.error("Error processing contact form:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
