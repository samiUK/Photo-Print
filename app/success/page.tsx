"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download } from "lucide-react"
import Image from "next/image"
import { jsPDF } from "jspdf"
import { paperSizes } from "@/lib/constants" // Import paperSizes

export default function SuccessPage() {
  const [nonWatermarkedImage, setNonWatermarkedImage] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<"jpeg" | "png" | "pdf">("jpeg")
  const [paperSizeId, setPaperSizeId] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve the image data and download format from sessionStorage
    const storedImage = sessionStorage.getItem("nonWatermarkedCollage")
    const storedFormat = sessionStorage.getItem("downloadFormat") as "jpeg" | "png" | "pdf"
    const storedPaperSizeId = sessionStorage.getItem("paperSizeId")

    if (storedImage) {
      setNonWatermarkedImage(storedImage)
    }
    if (storedFormat) {
      setDownloadFormat(storedFormat)
    }
    if (storedPaperSizeId) {
      setPaperSizeId(storedPaperSizeId)
    }

    // Clear sessionStorage after retrieval to prevent stale data
    sessionStorage.removeItem("nonWatermarkedCollage")
    sessionStorage.removeItem("downloadFormat")
    sessionStorage.removeItem("paperSizeId")
  }, [])

  const handleDownload = async () => {
    if (nonWatermarkedImage) {
      const link = document.createElement("a")
      if (downloadFormat === "pdf") {
        const selectedPaperSize = paperSizes.find((s) => s.id === paperSizeId)
        const doc = new jsPDF({
          orientation:
            (selectedPaperSize?.widthInches || 6) > (selectedPaperSize?.heightInches || 4) ? "landscape" : "portrait",
          unit: "in",
          format: [selectedPaperSize?.widthInches || 6, selectedPaperSize?.heightInches || 4],
        })
        const imgWidth = doc.internal.pageSize.getWidth()
        const imgHeight = doc.internal.pageSize.getHeight()
        doc.addImage(nonWatermarkedImage, "JPEG", 0, 0, imgWidth, imgHeight)
        doc.save("passport-photo-collage.pdf")
      } else {
        link.href = nonWatermarkedImage
        link.download = `passport-photo-collage.${downloadFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="text-3xl font-bold text-gray-900 mt-4">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-800">Your collage is ready for download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {nonWatermarkedImage ? (
            <>
              <div className="flex justify-center">
                <Image
                  src={nonWatermarkedImage || "/placeholder.svg"}
                  alt="Your High-Quality Photo Collage"
                  width={400}
                  height={300}
                  className="max-w-full h-auto border rounded-md shadow-lg"
                  priority
                />
              </div>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download Your Collage ({downloadFormat.toUpperCase()})
              </Button>
            </>
          ) : (
            <p className="text-gray-800">
              No collage found. Please return to the main page and generate your collage again.
            </p>
          )}
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
