import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { JobsProvider } from "@/lib/jobs-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FMG MARINE SERVICE LTD",
  description: "Maritime Logistics and Operations Portal",
    
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <JobsProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </JobsProvider>
        <Toaster />
      </body>
    </html>
  )
}
