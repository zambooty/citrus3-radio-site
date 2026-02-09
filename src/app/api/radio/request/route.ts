import { NextResponse } from 'next/server';

const BASE_URL = process.env.CENTOVA_API_URL || "http://cast3.citrus3.com:2199/external/rpc.php";
const USERNAME = process.env.CENTOVA_USERNAME || "casf";
const RID = process.env.CENTOVA_RID || "casf";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { artist, title, sender, email, dedication } = body;

        // Construct URL for GET request (Citrus3 uses GET for this RPC)
        const params = new URLSearchParams({
            m: 'request.submit',
            username: USERNAME,
            rid: RID,
            artist: artist,
            title: title,
            sender: sender,
            email: email,
            dedi: dedication || '',
        });

        const rpcUrl = `${BASE_URL}?${params.toString()}`;

        const response = await fetch(rpcUrl);
        const data = await response.json();

        if (data.type === 'error') {
            return NextResponse.json({ error: data.error || 'Request failed' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: data.data?.[0] || 'Request submitted' });

    } catch (error) {
        console.error("Error submitting request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
