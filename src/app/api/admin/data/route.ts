import { auth } from "@/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_FILES = ["news", "shows", "schedule"];
const DATA_DIR = path.join(process.cwd(), "src/data");

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file || !ALLOWED_FILES.includes(file)) {
        return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    try {
        const filePath = path.join(DATA_DIR, `${file}.json`);
        const data = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
});

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { file, content } = body;

        if (!file || !ALLOWED_FILES.includes(file)) {
            return NextResponse.json({ error: "Invalid file" }, { status: 400 });
        }

        const filePath = path.join(DATA_DIR, `${file}.json`);

        // Basic validation: ensure it's valid JSON before writing
        JSON.stringify(content);

        // Write to file with pretty print
        await fs.writeFile(filePath, JSON.stringify(content, null, 4), "utf-8");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Write error:", error);
        return NextResponse.json({ error: "Failed to write file" }, { status: 500 });
    }
});
