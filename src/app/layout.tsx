import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LivePlayer } from "@/components/player/LivePlayer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CASF | Central Valley Community Radio",
  description: "Live Human Radio. Your local community radio station broadcasting refreshing mix of music, local news, and community voices.",
  keywords: ["community radio", "CASF", "Central Valley", "live radio", "local news", "music", "radio station"],
  openGraph: {
    title: "CASF | Central Valley Community Radio",
    description: "Live Human Radio. Your local community radio station.",
    url: "https://casfradio.ca",
    siteName: "CASF Radio",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CASF | Central Valley Community Radio",
    description: "Live Human Radio directly from the Central Valley.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col pb-24`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-TC9B2W9M6K"} />

          <Header />
          <main className="flex-1 w-full container mx-auto px-4 py-8">
            {children}
          </main>
          <LivePlayer />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
