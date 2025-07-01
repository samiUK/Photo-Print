import { NextResponse } from "next/server"
import Stripe from "stripe"
import { countryRequirements, BASE_PRICE_USD, BASE_PRICE_GBP } from "@/lib/constants"

// Check if Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables")
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    })
  : null

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error("Stripe is not configured - missing STRIPE_SECRET_KEY")
      return new NextResponse("Payment system not configured", { status: 500 })
    }

    const { countryId, totalPhotos } = await req.json()

    const countryReq = countryRequirements.find((req) => req.id === countryId)

    if (!countryReq) {
      return new NextResponse("Invalid country selected", { status: 400 })
    }

    const basePrice = countryReq.currency === "GBP" ? BASE_PRICE_GBP : BASE_PRICE_USD
    const amount = Math.round(basePrice * 100) // Stripe expects amount in cents/pence

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-app.vercel.app"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: countryReq.currency.toLowerCase(),
            product_data: {
              name: `${countryReq.name} Photo Collage`,
              description: `Print-ready collage with ${totalPhotos} photos on selected paper size.`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        countryId,
        totalPhotos: totalPhotos.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error)
    return new NextResponse(`Error creating checkout session: ${error.message}`, { status: 500 })
  }
}
