import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bbetter | Premium Lifestyle Essentials & Signature Scents",
  description: "Discover our curated collection of problem-solving utilities, smart gadgets, and exclusive premium fragrances designed for an unforgettable presence.",
  keywords: ["ecommerce", "premium fragrances", "smart lifestyle", "luxury", "Bbetter"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bbetter.in",
    title: "Bbetter | Premium Lifestyle Essentials",
    description: "Discover our curated collection of problem-solving utilities and exclusive premium fragrances.",
    siteName: "Bbetter"
  },
  twitter: {
    card: "summary_large_image",
    title: "Bbetter | Premium Lifestyle",
    description: "Discover our curated collection of premium fragrances and smart lifestyle gadgets.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { getCategories } from "@/lib/actions/firestore";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased text-foreground bg-background">
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            <CartDrawer />
            <WhatsAppWidget />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
