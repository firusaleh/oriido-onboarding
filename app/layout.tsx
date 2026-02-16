import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oriido Onboarding",
  description: "Restaurant Onboarding Tool für Oriido Verkäufer",
  manifest: "/manifest.json",
  themeColor: "#FF6B35",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oriido",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
          <BottomNav />
        </div>
        <Toaster 
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: '#1F1F2A',
              border: '1px solid #2A2A3C',
              color: '#E5E5EA',
            },
          }}
        />
      </body>
    </html>
  );
}