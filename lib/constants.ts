// lib/constants.ts
export const DPI = 300 // Dots per inch for print quality
export const PHOTO_PADDING_MM = 1 // Reduced padding around each photo in millimeters

export const BASE_PRICE_USD = 0.6 // Updated base price for USD
export const BASE_PRICE_GBP = 0.5 // Base price for collage in GBP (for UK)

export interface CountryRequirement {
  id: string
  name: string
  photoWidthMm: number // Photo width in millimeters
  photoHeightMm: number // Photo height in millimeters
  background: "white" | "off-white" | "blue" | "red" | "light-grey" | "light-blue" // Expanded background colors
  description: string
  currency: "USD" | "GBP" // Currency for this country's pricing
}

export const countryRequirements: CountryRequirement[] = [
  {
    id: "us",
    name: "USA Passport Photo",
    photoWidthMm: 50.8, // 2 inches
    photoHeightMm: 50.8, // 2 inches
    background: "white",
    description: "2x2 inch photo, white background.",
    currency: "USD",
  },
  {
    id: "uk",
    name: "UK Passport Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "off-white",
    description: "35x45mm photo, cream or grey background.",
    currency: "GBP",
  },
  {
    id: "canada",
    name: "Canada Passport Photo",
    photoWidthMm: 50,
    photoHeightMm: 70,
    background: "white",
    description: "50x70mm photo, white background.",
    currency: "USD",
  },
  {
    id: "australia",
    name: "Australia Passport Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "light-grey",
    description: "35x45mm photo, plain light grey or white background.",
    currency: "USD",
  },
  {
    id: "germany",
    name: "Germany Passport Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "white",
    description: "35x45mm photo, light background.",
    currency: "USD",
  },
  {
    id: "japan",
    name: "Japan Passport Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "white",
    description: "35x45mm photo, white background.",
    currency: "USD",
  },
  {
    id: "china",
    name: "China Visa Photo",
    photoWidthMm: 33,
    photoHeightMm: 48,
    background: "white",
    description: "33x48mm photo, white or light blue background.",
    currency: "USD",
  },
  {
    id: "france",
    name: "France Passport Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "light-grey",
    description: "35x45mm photo, light background.",
    currency: "USD",
  },
  {
    id: "brazil",
    name: "Brazil Passport Photo",
    photoWidthMm: 50,
    photoHeightMm: 70,
    background: "white",
    description: "50x70mm photo, white background.",
    currency: "USD",
  },
  {
    id: "india",
    name: "India Visa Photo",
    photoWidthMm: 50,
    photoHeightMm: 50,
    background: "white",
    description: "50x50mm photo, white background.",
    currency: "USD",
  },
  {
    id: "schengen",
    name: "Schengen Visa Photo",
    photoWidthMm: 35,
    photoHeightMm: 45,
    background: "white",
    description: "35x45mm photo, white background.",
    currency: "USD",
  },
]

export interface PaperSize {
  id: string
  name: string
  widthInches: number
  heightInches: number
}

export const paperSizes: PaperSize[] = [
  { id: "6x4", name: "6x4 inch (Standard Photo)", widthInches: 6, heightInches: 4 },
  { id: "7x5", name: "7x5 inch", widthInches: 7, heightInches: 5 },
]

// Helper to convert mm to pixels
export const mmToPixels = (mm: number, dpi: number) => (mm / 25.4) * dpi
