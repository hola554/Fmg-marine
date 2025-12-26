"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Ship, Lock, Mail, User } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // Redirect to login with success message
        router.push("/auth/login?message=Check your email to confirm your account")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/image.png" alt="FMG Marine Port" fill className="object-cover brightness-[0.3]" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <Card className="relative z-10 w-full max-w-md mx-4 bg-black/60 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Ship className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white underline decoration-blue-500/30">
            FMG MARINE SERVICE LTD
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">Create your account for maritime operations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fmgmarine.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                Sign in
              </Link>
            </p>
            <p className="text-gray-400">Authorized Personnel Only</p>
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
