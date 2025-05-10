import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/privacy', '/about', '/terms'];

// Auth paths that should redirect to user panel if already authenticated
const authPaths = ['/sign-in', '/sign-up', '/forgot-password'];

// Paths that require admin role
const adminPaths = ['/admin-dashboard'];

// Paths that require regular user (non-admin) role
const userPaths = ['/user-panel'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth_token');

  // Handle root path specially
  if (pathname === '/') {
    if (authToken?.value) {
      try {
        const payload = parseJwt(authToken.value);
        const redirectUrl = new URL(
          payload?.admin ? '/admin-dashboard' : '/user-panel',
          request.url
        );
        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // If user is authenticated and tries to access auth pages, redirect to appropriate dashboard
  if (authToken?.value && authPaths.includes(pathname)) {
    try {
      const payload = parseJwt(authToken.value);
      const redirectUrl = new URL(
        payload?.admin ? '/admin-dashboard' : '/user-panel',
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      return NextResponse.next();
    }
  }

  // Allow public paths without authentication
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!authToken?.value && !publicPaths.includes(pathname) && !authPaths.includes(pathname)) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Verify user roles and access
  if (authToken?.value) {
    try {
      const payload = parseJwt(authToken.value);

      // Prevent admin users from accessing user panel
      if (userPaths.includes(pathname) && payload?.admin) {
        const adminDashboardUrl = new URL('/admin-dashboard', request.url);
        return NextResponse.redirect(adminDashboardUrl);
      }

      // Prevent regular users from accessing admin routes
      if (adminPaths.includes(pathname) && !payload?.admin) {
        const userPanelUrl = new URL('/user-panel', request.url);
        return NextResponse.redirect(userPanelUrl);
      }
    } catch (error) {
      const signInUrl = new URL('/sign-in', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// Helper function to parse JWT token
function parseJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

// Configure which routes should use the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};