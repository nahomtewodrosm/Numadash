import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NUMA RUN outrun extinction",
  description:
    "Outrun extinction in a browser-native 3D endless runner. Three lanes, real-time WebGL, keyboard controls and a database-powered leaderboard. Built with Next.js, React Three Fiber and Jest.",
  applicationName: "NUMA RUN",
  keywords: [
    "3D endless runner",
    "dinosaur game",
    "Next.js",
    "React Three Fiber",
    "database",
    "WebGL",
    "full-stack portfolio",
  ],
  authors: [{ name: "NUMA RUN" }],
  openGraph: {
    title: "NUMA RUN — outrun extinction",
    description:
      "A three-lane 3D endless runner built with Next.js, WebGL and a database.",
    type: "website",
    siteName: "NUMA RUN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NUMA RUN — outrun extinction",
    description:
      "A three-lane 3D endless runner built with Next.js, WebGL and a database.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee5" },
    { media: "(prefers-color-scheme: dark)", color: "#080807" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <div id="top" className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
