import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar    from "@/src/components/layouts/Navbar";
import BottomNav from "@/src/components/layouts/BottomNav";
import { TooltipProvider } from "@/src/components/elements/Tooltip";
import PageTransition   from "@/src/components/layouts/PageTransition";
import "./globals.css";

const SITE_URL = 'https://farm-epidemic-sim.vercel.app'

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
  title: {
    default: 'Farm Epidemic Simulator',
    template: '%s | Farm Epidemic Simulator',
  },
  description: 'Interactive stochastic SEIR disease outbreak simulator for a closed farm ecosystem. Adjust transmission rates, incubation periods, and population size to study epidemic dynamics in real time.',
  keywords: [
    'SEIR model', 'SEIR simulation', 'epidemic simulation', 'disease simulation',
    'stochastic model', 'stochastic simulation', 'agent-based model', 'agent-based simulation',
    'disease spread', 'disease transmission', 'infectious disease model',
    'farm epidemic', 'livestock disease', 'animal disease simulation',
    'epidemiology', 'mathematical epidemiology', 'compartmental model',
    'basic reproduction number', 'R0', 'R naught', 'transmission rate',
    'incubation period', 'recovery rate', 'attack rate', 'herd immunity',
    'Monte Carlo simulation', 'exponential distribution', 'Bernoulli trial',
    'pemodelan stokastik', 'simulasi wabah', 'simulasi epidemi',
    'penyebaran penyakit', 'model SEIR', 'wabah hewan ternak',
    'simulasi interaktif', 'model matematika epidemiologi',
    'Teknik Pemodelan Stokastik', 'TPS', 'UGM', 'Universitas Gadjah Mada',
    'tugas akhir TPS', 'final project stochastic modeling',
    'interactive epidemic simulator', 'real-time disease simulation',
  ],
  authors: [
    { name: 'Aulia Nur Fajri Tri Anggoro' },
    { name: 'Muhammad Farrel Al Ghazy' },
    { name: 'Muhammad Khoirunas' },
  ],
  creator: 'TPS Group — Universitas Gadjah Mada',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Farm Epidemic Simulator',
    title: 'Farm Epidemic Simulator',
    description: 'Interactive stochastic SEIR disease outbreak simulator. Watch disease spread through a farm population in real time.',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farm Epidemic Simulator',
    description: 'Interactive stochastic SEIR disease outbreak simulator. Watch disease spread through a farm population in real time.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'oNI8ICu2wfwmyQI0VAUrBfJE7e_VbFNdoRitzwWZNdo',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Farm Epidemic Simulator',
  url: SITE_URL,
  description: 'Interactive stochastic SEIR disease outbreak simulator for a closed farm ecosystem.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'id',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: [
    { '@type': 'Person', name: 'Aulia Nur Fajri Tri Anggoro' },
    { '@type': 'Person', name: 'Muhammad Farrel Al Ghazy' },
    { '@type': 'Person', name: 'Muhammad Khoirunas' },
  ],
  sourceOrganization: { '@type': 'Organization', name: 'Universitas Gadjah Mada' },
}

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
