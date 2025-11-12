import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Passport Photo Collage Generator | Print-Ready Official Document Photos",
  description:
    "Generate print-ready passport and visa photo collages instantly. Upload your photo, select country-specific requirements, and download high-quality collages for printing. Support for USA, UK, Canada, Australia, Schengen, and more.",
  keywords:
    "passport photo, visa photo, photo collage, print photos, document photos, photo generator, online photo tool, official photos, passport photo maker, visa photo generator, print ready passport photos, instant passport photo, passport photo online",
  authors: [{ name: "Collage4prints" }],
  creator: "Collage4prints",
  publisher: "Collage4prints",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://collage4prints.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Passport Photo Collage Generator | Print-Ready Official Document Photos",
    description:
      "Generate print-ready passport and visa photo collages instantly. Upload your photo, select country-specific requirements, and download high-quality collages for printing.",
    url: "/",
    siteName: "Collage4prints",
    images: [
      {
        url: "/images/how-it-works.png",
        width: 612,
        height: 200,
        alt: "How to generate passport photo collages - Upload, Select, Print",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Photo Collage Generator | Print-Ready Official Document Photos",
    description:
      "Generate print-ready passport and visa photo collages instantly. Support for 11+ countries including USA, UK, Canada, Australia.",
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
