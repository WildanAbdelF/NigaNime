import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Using Inter as body font (Trueno alternative - clean sans-serif)
const inter = Inter({
  variable: "--font-trueno",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AnimeStream - Watch Your Favorite Anime",
  description: "Stream anime online, explore trending anime, schedules, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-[#0f1729] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
