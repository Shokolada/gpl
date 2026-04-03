import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPL — Global Precision League",
  description: "Competitive precision timing game. Stop the bomb at exactly 10.000 seconds. Conquer the map.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GPL",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#181b22",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrainsMono.variable} ${inter.variable} h-full`}>
      <body className="min-h-full bg-[#181b22] text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
