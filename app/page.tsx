"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation" // Import useRouter
import {
  countryRequirements,
  paperSizes,
  DPI,
  mmToPixels,
  PHOTO_PADDING_MM,
  BASE_PRICE_USD,
  BASE_PRICE_GBP,
} from "@/lib/constants"

// Client-side image processing function using Canvas API
async function processAndCollageImage(
  imageDataUrl: string,
  countryId: string,
  paperSizeId: string,
): Promise<{
  success: boolean
  watermarkedImage?: string
  nonWatermarkedImage?: string
  error?: string
  totalPhotos?: number
}> {
  const countryReq = countryRequirements.find((req) => req.id === countryId)
  const paperSize = paperSizes.find((size) => size.id === paperSizeId)

  if (!countryReq || !paperSize) {
    return { success: false, error: "Invalid country or paper size selected." }
  }

  try {
    // Load the uploaded image
    const originalImage = new window.Image()
    originalImage.crossOrigin = "anonymous" // Important for CORS if image is from external URL, though here it's data URL
    originalImage.src = imageDataUrl
    await new Promise((resolve, reject) => {
      originalImage.onload = resolve
      originalImage.onerror = reject
    })

    // Calculate dimensions for the single processed photo
    const photoWidthPx = Math.round(mmToPixels(countryReq.photoWidthMm, DPI))
    const photoHeightPx = Math.round(mmToPixels(countryReq.photoHeightMm, DPI))
    const photoPaddingPx = Math.round(mmToPixels(PHOTO_PADDING_MM, DPI))

    // Create a temporary canvas for processing the single photo
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = photoWidthPx
    tempCanvas.height = photoHeightPx
    const tempCtx = tempCanvas.getContext("2d")!

    // Apply background color based on country requirement
    const backgroundColor =
      countryReq.background === "white"
        ? "#FFFFFF"
        : countryReq.background === "off-white"
          ? "#F5F5DC" // Light beige/off-white
          : countryReq.background === "blue"
            ? "#ADD8E6" // Light blue
            : countryReq.background === "red"
              ? "#FFCCCB" // Light red
              : countryReq.background === "light-grey"
                ? "#D3D3D3" // Light grey
                : countryReq.background === "light-blue"
                  ? "#ADD8E6" // Light blue
                  : "#FFFFFF" // Default to white

    tempCtx.fillStyle = backgroundColor
    tempCtx.fillRect(0, 0, photoWidthPx, photoHeightPx)

    // Calculate crop parameters to fit and center the image
    const originalAspectRatio = originalImage.width / originalImage.height
    const targetAspectRatio = photoWidthPx / photoHeightPx

    let sx = 0,
      sy = 0,
      sWidth = originalImage.width,
      sHeight = originalImage.height

    if (originalAspectRatio > targetAspectRatio) {
      // Original image is wider than target, crop width
      sWidth = originalImage.height * targetAspectRatio
      sx = (originalImage.width - sWidth) / 2
    } else {
      // Original image is taller than target, crop height
      sHeight = originalImage.width / targetAspectRatio
      sy = (originalImage.height - sHeight) / 2
    }

    // Draw the cropped and resized image onto the temporary canvas
    tempCtx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, photoWidthPx, photoHeightPx)

    const processedPhotoDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9) // Quality 90%

    // Generate collage layout
    const paperWidthPx = Math.round(paperSize.widthInches * DPI)
    const paperHeightPx = Math.round(paperSize.heightInches * DPI)

    // Calculate how many photos fit, considering padding
    const effectivePhotoWidth = photoWidthPx + photoPaddingPx * 2 // Photo + padding on both sides
    const effectivePhotoHeight = photoHeightPx + photoPaddingPx * 2

    const photosPerRow = Math.floor(paperWidthPx / effectivePhotoWidth)
    const photosPerColumn = Math.floor(paperHeightPx / effectivePhotoHeight)
    const totalPhotos = photosPerRow * photosPerColumn

    if (totalPhotos === 0) {
      return { success: false, error: "Photo size too large for selected paper, even with minimal padding." }
    }

    const collageCanvas = document.createElement("canvas")
    collageCanvas.width = paperWidthPx
    collageCanvas.height = paperHeightPx
    const collageCtx = collageCanvas.getContext("2d")!

    // Fill collage background white
    collageCtx.fillStyle = "#FFFFFF"
    collageCtx.fillRect(0, 0, paperWidthPx, paperHeightPx)

    // Load the processed single photo for collage
    const singlePhotoForCollage = new window.Image()
    singlePhotoForCollage.crossOrigin = "anonymous"
    singlePhotoForCollage.src = processedPhotoDataUrl
    await new Promise((resolve, reject) => {
      singlePhotoForCollage.onload = resolve
      singlePhotoForCollage.onerror = reject
    })

    // Calculate total grid dimensions including padding
    const totalGridWidth = photosPerRow * effectivePhotoWidth
    const totalGridHeight = photosPerColumn * effectivePhotoHeight

    // Calculate offset to center the grid
    const offsetX = (paperWidthPx - totalGridWidth) / 2
    const offsetY = (paperHeightPx - totalGridHeight) / 2

    // Draw photos onto the collage canvas with padding and centering
    for (let i = 0; i < totalPhotos; i++) {
      const row = Math.floor(i / photosPerRow)
      const col = i % photosPerRow
      const x = offsetX + col * effectivePhotoWidth + photoPaddingPx
      const y = offsetY + row * effectivePhotoHeight + photoPaddingPx
      collageCtx.drawImage(singlePhotoForCollage, x, y, photoWidthPx, photoHeightPx)
    }

    const nonWatermarkedImage = collageCanvas.toDataURL("image/jpeg", 1.0) // High quality for download

    // Create a separate canvas for the watermarked preview
    const watermarkedCanvas = document.createElement("canvas")
    watermarkedCanvas.width = paperWidthPx
    watermarkedCanvas.height = paperHeightPx
    const watermarkedCtx = watermarkedCanvas.getContext("2d")!

    // Draw the non-watermarked image onto the watermarked canvas
    const tempCollageImage = new window.Image()
    tempCollageImage.crossOrigin = "anonymous"
    tempCollageImage.src = nonWatermarkedImage
    await new Promise((resolve, reject) => {
      tempCollageImage.onload = resolve
      tempCollageImage.onerror = reject
    })
    watermarkedCtx.drawImage(tempCollageImage, 0, 0, paperWidthPx, paperHeightPx)

    // Add "Specimen" watermarks in a grid pattern
    watermarkedCtx.font = "bold 80px Arial" // Slightly larger font
    watermarkedCtx.fillStyle = "rgba(0, 0, 0, 0.25)" // Semi-transparent black
    watermarkedCtx.textAlign = "center"
    watermarkedCtx.textBaseline = "middle"

    const watermarkText = "SPECIMEN"
    const rotationAngle = -Math.PI / 6 // -30 degrees for a more spread out look

    // Calculate grid for watermarks
    const stepX = paperWidthPx / 2
    const stepY = paperHeightPx / 2

    for (let y = -stepY; y < paperHeightPx + stepY; y += stepY) {
      for (let x = -stepX; x < paperWidthPx + stepX; x += stepX) {
        watermarkedCtx.save()
        watermarkedCtx.translate(x, y)
        watermarkedCtx.rotate(rotationAngle)
        watermarkedCtx.fillText(watermarkText, 0, 0)
        watermarkedCtx.restore()
      }
    }

    const watermarkedImage = watermarkedCanvas.toDataURL("image/jpeg", 0.8) // Lower quality for preview

    return { success: true, watermarkedImage, nonWatermarkedImage, totalPhotos }
  } catch (error: any) {
    console.error("Image processing error:", error)
    return { success: false, error: error.message || "Failed to process image." }
  }
}

export default function Home() {
  const [result, setResult] = useState<{
    success: boolean
    watermarkedImage?: string
    nonWatermarkedImage?: string
    error?: string
    totalPhotos?: number
  } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<"jpeg" | "png" | "pdf">("jpeg")
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter() // Initialize useRouter

  const currentCountry = selectedCountryId ? countryRequirements.find((req) => req.id === selectedCountryId) : null
  const currentPrice = currentCountry?.currency === "GBP" ? BASE_PRICE_GBP : BASE_PRICE_USD
  const currencySymbol = currentCountry?.currency === "GBP" ? "£" : "$"

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setResult(null) // Clear previous result on new image upload
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
    const processingResult = await processAndCollageImage(selectedImage, countryId, paperSizeId)
    setResult(processingResult)
    setIsLoading(false)
  }

  const handleInitiatePayment = async () => {
    if (!result?.success || !result.nonWatermarkedImage || !selectedCountryId || !result.totalPhotos) {
      setResult({ success: false, error: "Please generate a collage first." })
      return
    }

    setIsLoading(true)
    try {
      // Store the non-watermarked image in sessionStorage before redirecting
      // This allows the success page to retrieve it for download
      sessionStorage.setItem("nonWatermarkedCollage", result.nonWatermarkedImage)
      sessionStorage.setItem("downloadFormat", downloadFormat)
      sessionStorage.setItem(
        "paperSizeId",
        (formRef.current?.elements.namedItem("paperSize") as HTMLSelectElement)?.value || "6x4",
      )

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

      const data = await response.json()

      if (response.ok) {
        router.push(data.url) // Redirect to Stripe Checkout
      } else {
        setResult({ success: false, error: data.error || "Failed to initiate payment." })
      }
    } catch (error: any) {
      console.error("Error initiating payment:", error)
      setResult({ success: false, error: error.message || "Failed to initiate payment." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <header className="w-full max-w-2xl py-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900">Photo-Print-Generator</h1>
        <p className="mt-2 text-lg text-gray-800">Your go-to tool for official document photos.</p>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader className="bg-white">
            <CardTitle className="text-3xl font-bold text-gray-900">Passport Photo Collage Generator</CardTitle>
            <CardDescription className="text-gray-800">
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
                    setResult(null) // Clear result on country change
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
                <Select name="paperSize" defaultValue="6x4" required>
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
                className="w-full bg-green-600 hover:bg-green-700 text-white" // Changed to green
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
                    width={
                      paperSizes.find(
                        (s) => s.id === (formRef.current?.elements.namedItem("paperSize") as HTMLSelectElement)?.value,
                      )?.widthInches * 100 || 600
                    }
                    height={
                      paperSizes.find(
                        (s) => s.id === (formRef.current?.elements.namedItem("paperSize") as HTMLSelectElement)?.value,
                      )?.heightInches * 100 || 400
                    }
                    className="max-w-full h-auto border rounded-md shadow-lg"
                    priority
                  />
                </div>
                <div className="text-center text-sm text-gray-800">
                  Collage generated with{" "}
                  {
                    countryRequirements.find(
                      (req) =>
                        req.id ===
                        (formRef.current?.elements.namedItem("passport-visa-type") as HTMLSelectElement)?.value,
                    )?.name
                  }{" "}
                  photos on{" "}
                  {
                    paperSizes.find(
                      (s) => s.id === (formRef.current?.elements.namedItem("paperSize") as HTMLSelectElement)?.value,
                    )?.name
                  }{" "}
                  paper.
                  <br />
                  **Total Photos on Sheet: {result.totalPhotos}**
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 bg-white">
            {result?.success && result.nonWatermarkedImage && (
              <>
                <div className="w-full text-center text-lg font-bold text-gray-900">
                  Price: {currencySymbol}
                  {currentPrice.toFixed(2)}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="download-format" className="text-gray-900">
                    Download Format
                  </Label>
                  <Select
                    name="download-format"
                    defaultValue="jpeg"
                    onValueChange={(value) => setDownloadFormat(value as "jpeg" | "png" | "pdf")}
                  >
                    <SelectTrigger id="download-format" className="bg-white text-gray-900">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                      <SelectItem
                        key="jpeg"
                        value="jpeg"
                        className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                      >
                        JPEG (High Quality)
                      </SelectItem>
                      <SelectItem
                        key="png"
                        value="png"
                        className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                      >
                        PNG (Lossless)
                      </SelectItem>
                      <SelectItem
                        key="pdf"
                        value="pdf"
                        className="bg-white text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                      >
                        PDF (Print Ready)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInitiatePayment} // Changed to initiate payment
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Redirecting to Payment..." : "Make payment and download HD image"}
                </Button>
                <p className="text-sm text-gray-800 text-center">
                  (You will be redirected to Stripe to complete your purchase.)
                </p>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
