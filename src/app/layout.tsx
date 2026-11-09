import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SiteFrame } from "@/components/layout/SiteFrame";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleAnalytics gaId="G-TC9B2W9M6K" />
          <SiteFrame>{children}</SiteFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
