'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship } from "lucide-react"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/dashboard")
  }

  // Auto redirect after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 2000) // Auto redirect after 2 seconds

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <Image src="/images/image.png" alt="FMG Marine Port" fill className="object-cover brightness-[0.3] -z-10" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent -z-10" />

      <Card className="relative z-30 w-full max-w-md mx-4 bg-black/90 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Ship className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white underline decoration-blue-500/30">
            FMG MARINE SERVICE LTD
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">Maritime Logistics and Operations Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-gray-300">Welcome to FMG Marine Service Portal</p>
            <p className="text-center text-sm text-gray-400">Auto-redirecting to dashboard in 2 seconds...</p>
            <Button onClick={handleLogin} className="w-full h-11 text-base font-semibold">
              Enter Portal
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p className="mb-2">Authorized Personnel Only</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/40 text-sm">
        &copy; 2025 FMG MARINE SERVICE LTD. All rights reserved.
      </div>
    </div>
  )
}
