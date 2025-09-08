import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminPath = req.nextUrl.pathname.startsWith('/admin')

    // If trying to access admin path without admin role, redirect to home
    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
        
        // Allow access to non-admin paths without auth
        if (!isAdminPath) return true
        
        // Require auth for admin paths
        return !!token
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ]
}