"use client"

import type React from "react"

import { Receipt, Settings, HelpCircle, Menu, LogOut, Ship, Briefcase, FileText, Files } from "lucide-react"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function handleNavigation() {
    setIsMobileMenuOpen(false)
    setIsNavigating(true)
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    return (
      <Link
        href={href}
        prefetch={true}
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23] disabled:opacity-50"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-black border border-white/10 shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-black transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-white/10
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link href="/dashboard" className="h-16 px-6 flex items-center border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Ship className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                FMG MARINE
                <br />
                SERVICE LTD
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Main
                </div>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Ship}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/jobs" icon={Briefcase}>
                    Jobs
                  </NavItem>
                  <NavItem href="/refund" icon={Receipt}>
                    Refund
                  </NavItem>
                  <NavItem href="/documents" icon={FileText}>
                    Documents
                  </NavItem>
                  <NavItem href="/company-files" icon={Files}>
                    Company Files
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-white/10">
            <div className="space-y-1">
              <NavItem href="/settings" icon={Settings}>
                Settings
              </NavItem>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/auth/login")
                  router.refresh()
                }}
                className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
