import type { Metadata, Viewport } from "next";
import { COPY } from "@/data/seed";
import { PlacesProvider } from "@/state/places";
import "./globals.css";

export const metadata: Metadata = {
  title: COPY.splash.wordmark,
  description: COPY.splash.line,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: COPY.splash.wordmark,
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#EFEDF5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light" data-theme="light">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <PlacesProvider>{children}</PlacesProvider>
      </body>
    </html>
  );
}
