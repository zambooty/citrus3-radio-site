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
                const validPassword = credentials.password === process.env.ADMIN_PASSWORD;
                const validUsername = credentials.username === process.env.ADMIN_USERNAME;

                if (validPassword && validUsername && process.env.ADMIN_PASSWORD && process.env.ADMIN_USERNAME) {
                    return { id: "1", name: "Admin", email: "admin@casfradio.ca" }
                }
                return null
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
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
