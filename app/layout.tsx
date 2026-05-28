import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar    from "@/src/components/layouts/Navbar";
import BottomNav from "@/src/components/layouts/BottomNav";
import { TooltipProvider } from "@/src/components/elements/Tooltip";
import PageTransition   from "@/src/components/layouts/PageTransition";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Farm Epidemic Simulator",
  description: "Stochastic Disease Outbreak Simulation in a Closed Farm Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-(--bg) text-(--text)">
        <TooltipProvider>
          <Navbar />
          <div className="pb-16 sm:pb-0">
            <PageTransition>{children}</PageTransition>
          </div>
          <BottomNav />
        </TooltipProvider>
      </body>
    </html>
  );
}
