import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { User } from '@/lib/types'

const employeeRoutes = ['/report', '/my-reports']
const adminRoutes = ['/dashboard']
const authRoutes = ['/', '/register', '/admin/login']

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const { pathname } = request.nextUrl

  let user: User | null = null
  if (sessionCookie) {
    try {
      user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    } catch (e) {
      // Invalid cookie, treat as logged out
    }
  }

  const isEmployeeRoute = employeeRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.includes(pathname) // Use exact match instead of startsWith

  // If user is not logged in and tries to access a protected route
  if (!user && (isEmployeeRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is logged in
  if (user) {
    // Determine the correct home page for this user
    const userHomePage = user.role === 'admin' ? '/dashboard' : '/report'
    
    // If user is on an auth route, redirect to their home page
    if (isAuthRoute) {
      // Avoid redirecting if they're already going to their home page
      if (pathname !== userHomePage) {
        return NextResponse.redirect(new URL(userHomePage, request.url))
      }
    }

    // If an employee tries to access an admin route
    if (isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/report', request.url))
    }

    // If an admin tries to access an employee route
    if (isEmployeeRoute && user.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/register',
    '/admin/login',
    '/report',
    '/my-reports',
    '/dashboard',
  ],
}
