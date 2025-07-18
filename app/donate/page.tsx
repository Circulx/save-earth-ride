"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Copy, Check, Smartphone, CreditCard, Building2, Hash, MapPin } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function DonatePage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const bankDetails = {
    accountName: "Moto Tourers And Biking Community Federation",
    bankName: "South Indian Bank",
    accountNumber: "0655073000000393",
    ifscCode: "SIBL0000655",
    upiId: "qr.federation@sib",
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`${field} copied to clipboard!`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Support Our Mission
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Help us build a stronger biking community, organize events, and promote safe riding practices across India.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* QR Code Section */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-fit">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl md:text-2xl">
                  <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  <span>Scan & Pay</span>
                </CardTitle>
                <p className="text-sm md:text-base text-muted-foreground">
                  Scan the QR code with any UPI app to donate instantly
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 md:space-y-6">
                {/* QR Code Container - Reduced size and padding */}
                <div className="relative">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white rounded-xl shadow-lg border-2 border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full relative">
                      <Image
                        src="/QR.jpg"
                        alt="UPI Payment QR Code"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                    <Smartphone className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="w-full">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Hash className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">UPI ID</p>
                        <p className="font-mono text-sm md:text-lg font-semibold truncate">{bankDetails.upiId}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.upiId, "UPI ID")}
                      className="hover:bg-white/50 flex-shrink-0 ml-2"
                    >
                      {copiedField === "UPI ID" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Badge variant="secondary" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2">
                  Instant • Secure • No Transaction Fee
                </Badge>
              </CardContent>
            </Card>

            {/* Bank Details Section */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-fit">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl md:text-2xl">
                  <Building2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  <span>Bank Transfer</span>
                </CardTitle>
                <p className="text-sm md:text-base text-muted-foreground">
                  Transfer directly to our bank account for larger donations
                </p>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {/* Account Name */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Account Name</p>
                        <p className="font-semibold text-sm md:text-base break-words leading-tight">
                          {bankDetails.accountName}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                      className="hover:bg-white/50 flex-shrink-0 ml-2"
                    >
                      {copiedField === "Account Name" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Bank Name */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Bank Name</p>
                        <p className="font-semibold text-sm md:text-base">{bankDetails.bankName}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                      className="hover:bg-white/50 flex-shrink-0 ml-2"
                    >
                      {copiedField === "Bank Name" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Hash className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Account Number</p>
                        <p className="font-mono font-semibold text-sm md:text-lg">{bankDetails.accountNumber}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                      className="hover:bg-white/50 flex-shrink-0 ml-2"
                    >
                      {copiedField === "Account Number" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">IFSC Code</p>
                        <p className="font-mono font-semibold text-sm md:text-lg">{bankDetails.ifscCode}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.ifscCode, "IFSC Code")}
                      className="hover:bg-white/50 flex-shrink-0 ml-2"
                    >
                      {copiedField === "IFSC Code" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Section */}
          <Card className="mt-6 lg:mt-8 border-0 shadow-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Your Contribution Makes a Difference</h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  Every donation helps us organize better events, improve safety measures, and build a stronger biking
                  community across India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Heart className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Community Events</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Organize rides, meetups, and safety workshops for bikers
                  </p>
                </div>

                <div className="text-center p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Safety Initiatives</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Promote road safety and responsible riding practices
                  </p>
                </div>

                <div className="text-center p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Platform Development</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Maintain and improve our community platform and services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Message */}
          <div className="text-center mt-6 lg:mt-8 p-4 md:p-6 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl border border-green-200/20">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Thank You for Your Support! 🙏</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Your contribution helps us build a safer and stronger biking community. Together, we ride towards a better
              future.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}