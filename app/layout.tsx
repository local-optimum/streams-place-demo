import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const pressStart2P = Press_Start_2P({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Streams Place - Collaborative Pixel Canvas on Somnia",
  description: "A decentralized, real-time collaborative pixel canvas powered by Somnia Data Streams. Place pixels, watch others create, and experience on-chain creativity.",
  keywords: ["blockchain", "somnia", "data streams", "collaborative", "pixel art", "web3"],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${pressStart2P.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

