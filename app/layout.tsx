import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Photo-Print-Generator - Your Go-To Tool for Official Document Photos",
  description:
    "Generate print-ready passport and visa photo collages based on country-specific requirements. Upload your photo, select the type, and get a high-quality collage for printing.",
  keywords:
    "passport photo, visa photo, photo collage, print photos, document photos, photo generator, online photo tool, official photos",
  openGraph: {
    title: "Photo-Print-Generator - Your Go-To Tool for Official Document Photos",
    description:
      "Generate print-ready passport and visa photo collages based on country-specific requirements. Upload your photo, select the type, and get a high-quality collage for printing.",
    url: "https://your-app-url.com",
    siteName: "Photo-Print-Generator",
    images: [
      {
        url: "/images/how-it-works.png",
        width: 600,
        height: 200,
        alt: "Photo-Print-Generator How it Works",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo-Print-Generator - Your Go-To Tool for Official Document Photos",
    description:
      "Generate print-ready passport and visa photo collages based on country-specific requirements. Upload your photo, select the type, and get a high-quality collage for printing.",
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
  generator: "v0.dev",
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
