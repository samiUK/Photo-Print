import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Passport Photo Collage Generator | Official Print-Ready Photos for USA, UK, Canada & More",
  description:
    "Create professional passport and visa photo collages online. Instant generation for 11+ countries including USA, UK, Canada, Australia, Germany, Japan, China, France, Brazil, India, Schengen. High-quality, print-ready, secure. Only £1 / $1.30.",
  keywords: [
    "passport photo maker",
    "visa photo generator",
    "passport photo collage",
    "print passport photos online",
    "USA passport photo",
    "UK passport photo",
    "Canada passport photo",
    "Australia passport photo",
    "Schengen visa photo",
    "official document photos",
    "passport photo printing",
    "visa photo requirements",
    "2x2 passport photo",
    "35x45mm photo",
    "passport size photo",
    "online passport photo tool",
    "instant passport photos",
    "cheap passport photos",
    "print ready passport photos",
    "300 dpi passport photo",
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
    title: "Passport Photo Collage Generator | Official Print-Ready Photos",
    description:
      "Create professional passport and visa photo collages for 11+ countries. Instant, secure, print-ready. Only £1 / $1.30.",
    url: "/",
    siteName: "Collage4prints",
    images: [
      {
        url: "/images/how-it-works.png",
        width: 612,
        height: 200,
        alt: "Generate passport photo collages - Upload, Select Country, Print",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Photo Collage Generator | Official Print-Ready Photos",
    description:
      "Create professional passport and visa photo collages for 11+ countries. Instant, secure, print-ready. Only £1 / $1.30.",
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
