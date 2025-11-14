import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Passport Photo Collage Generator | Free Photo Print Tool Online",
  description:
    "Free passport photo collage generator for printing. Create professional passport photo prints instantly. Best photo collage generator for USA, UK, Canada & 11+ countries. Only £1/$1.30 for print-ready downloads.",
  keywords: [
    "passport photo collage",
    "passport photo print",
    "photo collage generator",
    "photo print free",
    "free passport photo collage",
    "passport photo print online",
    "photo collage generator free",
    "print passport photos",
    "passport size photo collage",
    "visa photo collage",
    "photo collage for printing",
    "passport photo maker",
    "visa photo generator",
    "print passport photos online",
    "USA passport photo collage",
    "UK passport photo print",
    "Canada passport photo collage",
    "Australia passport photo",
    "Schengen visa photo collage",
    "official document photos",
    "passport photo printing service",
    "visa photo requirements",
    "2x2 passport photo collage",
    "35x45mm photo collage",
    "passport size photo generator",
    "online passport photo tool",
    "instant passport photos",
    "cheap passport photos",
    "print ready passport photos",
    "300 dpi passport photo collage",
    "passport photo print service",
    "collage for passport photos",
  ].join(", "),
  authors: [{ name: "Collage4prints" }],
  creator: "Collage4prints",
  publisher: "Collage4prints",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://collage4prints.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Passport Photo Collage Generator | Free Photo Print Tool",
    description:
      "Free passport photo collage generator. Create print-ready passport photo collages for 11+ countries instantly. Best photo collage generator for printing.",
    url: "/",
    siteName: "Collage4prints - Passport Photo Collage Generator",
    images: [
      {
        url: "/images/how-it-works.png",
        width: 612,
        height: 200,
        alt: "Generate passport photo collages for printing - Free tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Photo Collage Generator | Free Photo Print Tool",
    description:
      "Free passport photo collage generator. Create print-ready passport photo collages for 11+ countries. Best photo collage generator for printing.",
    images: ["/images/how-it-works.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  verification: {
    // Add your verification codes when ready
    // google: "your-google-verification-code",
    // bing: "your-bing-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
