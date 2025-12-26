import { NextResponse } from "next/server"

// Temporarily disabled middleware for debugging authentication
export async function middleware() {
  // Return next response without authentication checks
  return NextResponse.next()
}
