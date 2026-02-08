import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // In a real app, use a hash. For this file-based MVP, simple env check.
                // Default to 'admin'/'admin123' if not set.
                const validPassword = credentials.password === (process.env.ADMIN_PASSWORD || "admin123");
                const validUsername = credentials.username === (process.env.ADMIN_USERNAME || "admin");

                if (validPassword && validUsername) {
                    return { id: "1", name: "Admin", email: "admin@casfradio.ca" }
                }
                return null
            },
        }),
    ],
    secret: process.env.AUTH_SECRET || "secret-key-for-dev-only",
    pages: {
        signIn: "/admin/login", // Custom login page
    },
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users return true, otherwise false
            return !!auth
        },
    },
})
