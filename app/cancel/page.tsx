"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function CancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <CardTitle className="text-3xl font-bold text-gray-900 mt-4">Payment Cancelled</CardTitle>
          <CardDescription className="text-gray-800">Your payment was not completed. Please try again.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
        </CardContent>
      </Card>
    </div>
  )
}
