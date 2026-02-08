import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Middleware to protect admin routes
export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/admin/login")
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin")

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/admin", req.nextUrl))
        }
        return null
    }

    if (isAdminPage) {
        if (!isLoggedIn) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(
                new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.nextUrl)
            );
        }
    }

    return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
