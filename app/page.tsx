"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Shield } from "lucide-react"
import {
  countryRequirements,
  paperSizes,
  DPI,
  mmToPixels,
  PHOTO_PADDING_MM,
  BASE_PRICE_USD,
  BASE_PRICE_GBP,
} from "@/lib/constants"

// Simple image processing without complex async operations
function processImageSync(imageDataUrl: string, countryId: string, paperSizeId: string) {
  return new Promise((resolve) => {
    // Find country requirement
    let countryReq = null
    for (let i = 0; i < countryRequirements.length; i++) {
      if (countryRequirements[i].id === countryId) {
        countryReq = countryRequirements[i]
        break
      }
    }

    // Find paper size
    let paperSize = null
    for (let j = 0; j < paperSizes.length; j++) {
      if (paperSizes[j].id === paperSizeId) {
        paperSize = paperSizes[j]
        break
      }
    }

    if (!countryReq || !paperSize) {
      resolve({ success: false, error: "Invalid selection" })
      return
    }

    // Create image element
    const img = document.createElement("img")
    img.onload = () => {
      try {
        // Calculate dimensions
        const photoWidthPx = Math.round(mmToPixels(countryReq.photoWidthMm, DPI))
        const photoHeightPx = Math.round(mmToPixels(countryReq.photoHeightMm, DPI))
        const photoPaddingPx = Math.round(mmToPixels(PHOTO_PADDING_MM, DPI))

        // Create canvas
        const canvas = document.createElement("canvas")
        canvas.width = photoWidthPx
        canvas.height = photoHeightPx
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve({ success: false, error: "Canvas not supported" })
          return
        }

        // Set background
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, photoWidthPx, photoHeightPx)

        // Calculate crop dimensions to center crop the image
        const targetAspectRatio = photoWidthPx / photoHeightPx
        const sourceAspectRatio = img.width / img.height

        let sourceX = 0
        let sourceY = 0
        let sourceWidth = img.width
        let sourceHeight = img.height

        if (sourceAspectRatio > targetAspectRatio) {
          // Source is wider than target, crop horizontally
          sourceWidth = img.height * targetAspectRatio
          sourceX = (img.width - sourceWidth) / 2
        } else {
          // Source is taller than target, crop vertically
          sourceHeight = img.width / targetAspectRatio
          sourceY = (img.height - sourceHeight) / 2
        }

        // Draw the center-cropped image
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, photoWidthPx, photoHeightPx)

        // Create collage
        const paperWidthPx = Math.round(paperSize.widthInches * DPI)
        const paperHeightPx = Math.round(paperSize.heightInches * DPI)

        const effectivePhotoWidth = photoWidthPx + photoPaddingPx * 2
        const effectivePhotoHeight = photoHeightPx + photoPaddingPx * 2

        const photosPerRow = Math.floor(paperWidthPx / effectivePhotoWidth)
        const photosPerColumn = Math.floor(paperHeightPx / effectivePhotoHeight)
        const totalPhotos = photosPerRow * photosPerColumn

        if (totalPhotos === 0) {
          resolve({ success: false, error: "Photo too large for paper" })
          return
        }

        // Create collage canvas
        const collageCanvas = document.createElement("canvas")
        collageCanvas.width = paperWidthPx
        collageCanvas.height = paperHeightPx
        const collageCtx = collageCanvas.getContext("2d")

        if (!collageCtx) {
          resolve({ success: false, error: "Collage canvas not supported" })
          return
        }

        // Fill white background
        collageCtx.fillStyle = "#FFFFFF"
        collageCtx.fillRect(0, 0, paperWidthPx, paperHeightPx)

        // Get single photo data
        const singlePhotoData = canvas.toDataURL("image/jpeg", 0.9)

        // Create image for collage
        const photoImg = document.createElement("img")
        photoImg.onload = () => {
          // Calculate centering
          const totalGridWidth = photosPerRow * effectivePhotoWidth
          const totalGridHeight = photosPerColumn * effectivePhotoHeight
          const offsetX = (paperWidthPx - totalGridWidth) / 2
          const offsetY = (paperHeightPx - totalGridHeight) / 2

          // Draw photos
          for (let photoIndex = 0; photoIndex < totalPhotos; photoIndex++) {
            const row = Math.floor(photoIndex / photosPerRow)
            const col = photoIndex % photosPerRow
            const x = offsetX + col * effectivePhotoWidth + photoPaddingPx
            const y = offsetY + row * effectivePhotoHeight + photoPaddingPx
            collageCtx.drawImage(photoImg, x, y, photoWidthPx, photoHeightPx)
          }

          const nonWatermarkedImage = collageCanvas.toDataURL("image/jpeg", 1.0)

          // Create watermarked version
          const watermarkedCanvas = document.createElement("canvas")
          watermarkedCanvas.width = paperWidthPx
          watermarkedCanvas.height = paperHeightPx
          const watermarkedCtx = watermarkedCanvas.getContext("2d")

          if (!watermarkedCtx) {
            resolve({ success: false, error: "Watermark canvas not supported" })
            return
          }

          // Copy collage
          watermarkedCtx.drawImage(collageCanvas, 0, 0)

          // Add watermarks
          watermarkedCtx.font = "bold 80px Arial"
          watermarkedCtx.fillStyle = "rgba(0, 0, 0, 0.25)"
          watermarkedCtx.textAlign = "center"
          watermarkedCtx.textBaseline = "middle"

          const watermarkText = "SPECIMEN"
          const stepX = paperWidthPx / 2
          const stepY = paperHeightPx / 2

          for (let yCoord = 0; yCoord < paperHeightPx; yCoord += stepY) {
            for (let xCoord = 0; xCoord < paperWidthPx; xCoord += stepX) {
              watermarkedCtx.save()
              watermarkedCtx.translate(xCoord, yCoord)
              watermarkedCtx.rotate(-Math.PI / 6)
              watermarkedCtx.fillText(watermarkText, 0, 0)
              watermarkedCtx.restore()
            }
          }

          const watermarkedImage = watermarkedCanvas.toDataURL("image/jpeg", 0.8)

          resolve({
            success: true,
            watermarkedImage: watermarkedImage,
            nonWatermarkedImage: nonWatermarkedImage,
            totalPhotos: totalPhotos,
          })
        }

        photoImg.onerror = () => {
          resolve({ success: false, error: "Failed to load processed photo" })
        }

        photoImg.src = singlePhotoData
      } catch (error) {
        resolve({ success: false, error: "Processing failed: " + String(error) })
      }
    }

    img.onerror = () => {
      resolve({ success: false, error: "Failed to load image" })
    }

    img.src = imageDataUrl
  })
}

export default function Home() {
  const [result, setResult] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedPaperSizeId, setSelectedPaperSizeId] = useState("6x4")
  const [downloadFormat, setDownloadFormat] = useState("jpeg")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string)
          setResult(null)
        }
      }
      reader.onerror = () => {
        setResult({ success: false, error: "Failed to read file" })
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setResult(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedImage) {
      setResult({ success: false, error: "Please upload an image." })
      return
    }

    const formData = new FormData(event.currentTarget)
    const countryId = formData.get("passport-visa-type") as string
    const paperSizeId = formData.get("paperSize") as string

    if (!countryId || !paperSizeId) {
      setResult({ success: false, error: "Please select country and paper size." })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const processingResult = await processImageSync(selectedImage, countryId, paperSizeId)
      setResult(processingResult)
    } catch (error) {
      setResult({ success: false, error: "Processing failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!result?.success || !result.nonWatermarkedImage || !selectedCountryId) {
      return
    }

    setIsProcessingPayment(true)

    try {
      sessionStorage.setItem("nonWatermarkedCollage", result.nonWatermarkedImage)
      sessionStorage.setItem("downloadFormat", downloadFormat)
      sessionStorage.setItem("paperSizeId", selectedPaperSizeId)

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryId: selectedCountryId,
          totalPhotos: result.totalPhotos,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const responseData = await response.json()
      if (responseData.url) {
        window.location.href = responseData.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      setResult({ ...result, error: "Payment failed. Please try again." })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Get selected country for pricing
  const selectedCountry = countryRequirements.find((c) => c.id === selectedCountryId)
  const price = selectedCountry?.currency === "GBP" ? BASE_PRICE_GBP : BASE_PRICE_USD
  const currency = selectedCountry?.currency || "USD"

  // Find paper size for display
  const selectedPaperSize = paperSizes.find((s) => s.id === selectedPaperSizeId)

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-4">
      <header className="w-full max-w-2xl py-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-white drop-shadow-lg">
          Official Photo Collage Generator for Prints
        </h1>
        <p className="mt-3 text-lg text-blue-100 font-medium">Your go-to tool for official document photos.</p>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white">
            <CardTitle className="text-3xl font-bold text-gray-900">Passport Photo Collage Generator</CardTitle>
            <CardDescription className="text-gray-700 text-base">
              Upload your photo, select country requirements, and get a print-ready collage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-white">
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-6">
              <h3 className="text-xl font-semibold text-gray-900">How it works?</h3>
              <Image
                src="/images/how-it-works.png"
                alt="How it works: Upload image, choose photo type and paper size, print at local store"
                width={600}
                height={200}
                className="max-w-full h-auto object-contain"
                priority
              />
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="image" className="text-gray-900">
                  Upload Photo
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="cursor-pointer bg-white text-gray-900 file:bg-gray-200 file:text-gray-900 file:font-medium"
                />
                {selectedImage && (
                  <div className="mt-4 flex justify-center">
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Uploaded Photo Preview"
                      width={200}
                      height={200}
                      className="rounded-md object-cover shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="passport-visa-type" className="text-gray-900">
                  Select Passport/visa type
                </Label>
                <Select
                  name="passport-visa-type"
                  required
                  onValueChange={(value) => {
                    setSelectedCountryId(value)
                    setResult(null)
                  }}
                >
                  <SelectTrigger id="passport-visa-type" className="bg-white text-gray-900">
                    <SelectValue placeholder="Select Passport/visa type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    {countryRequirements.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.id}
                        className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                      >
                        {country.name} ({country.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="paperSize" className="text-gray-900">
                  Paper Size for Collage
                </Label>
                <Select
                  name="paperSize"
                  defaultValue="6x4"
                  required
                  onValueChange={(value) => {
                    setSelectedPaperSizeId(value)
                    setResult(null)
                  }}
                >
                  <SelectTrigger id="paperSize" className="bg-white text-gray-900">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    {paperSizes.map((size) => (
                      <SelectItem
                        key={size.id}
                        value={size.id}
                        className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                      >
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading || !selectedImage || !selectedCountryId}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Generating..." : "Generate Collage"}
              </Button>
            </form>

            {result?.error && <div className="mt-4 text-center text-red-500">Error: {result.error}</div>}

            {result?.success && result.watermarkedImage && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-center text-gray-900">Print-Ready Collage Preview</h3>
                <div className="flex justify-center">
                  <Image
                    src={result.watermarkedImage || "/placeholder.svg"}
                    alt="Generated Photo Collage Preview (Specimen)"
                    width={selectedPaperSize ? selectedPaperSize.widthInches * 100 : 600}
                    height={selectedPaperSize ? selectedPaperSize.heightInches * 100 : 400}
                    className="max-w-full h-auto border rounded-md shadow-lg"
                    priority
                  />
                </div>
                <div className="text-center text-sm text-gray-800">
                  Collage generated with {selectedCountry?.name || ""} photos on {selectedPaperSize?.name || ""} paper.
                  <br />
                  **Total Photos on Sheet: {result.totalPhotos}**
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 bg-white">
            {result?.success && result.nonWatermarkedImage && (
              <>
                <div className="w-full text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Get High-Quality Download</div>
                  <div className="text-lg text-gray-700 mb-4">
                    Only {currency === "GBP" ? "£" : "$"}
                    {price.toFixed(2)} {currency} for print-ready quality
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="download-format" className="text-gray-900">
                    Download Format
                  </Label>
                  <Select name="download-format" defaultValue="jpeg" onValueChange={setDownloadFormat}>
                    <SelectTrigger id="download-format" className="bg-white text-gray-900">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                      <SelectItem value="jpeg" className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        JPEG (High Quality)
                      </SelectItem>
                      <SelectItem value="png" className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        PNG (Lossless)
                      </SelectItem>
                      <SelectItem value="pdf" className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        PDF (Print Ready)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isProcessingPayment
                    ? "Processing..."
                    : `Pay ${currency === "GBP" ? "£" : "$"}${price.toFixed(2)} & Download`}
                </Button>

                <div className="text-xs text-gray-600 text-center space-y-1">
                  <p>✓ Secure payment via Stripe</p>
                  <p>✓ Instant download after payment</p>
                  <p>✓ High-resolution, print-ready quality</p>
                  <p>✓ No watermarks on final download</p>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </main>

      {/* Privacy Notice Footer */}
      <footer className="w-full max-w-2xl mt-8 mb-4">
        <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1 text-gray-800">Privacy & Security</p>
              <p>
                The photo generation takes place directly on your browser and we don't capture any data or images from
                you. So you can use the platform with peace of mind and print more copies of photos to save money.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
