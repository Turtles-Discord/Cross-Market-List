import { NextResponse } from 'next/server';
import { clerkMiddleware } from "@clerk/nextjs/server";

// Export the Clerk middleware - let Clerk handle the auth flow
export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 


