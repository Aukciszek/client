import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// No authentication required
const publicPaths = ['/privacy', '/about', '/terms'];

// Non-authenticated only
const authPaths = ['/sign-in', '/sign-up', '/forgot-password'];

// Admin only
const adminPaths = ['/admin-dashboard'];

// Regular user only
const userPaths = ['/user-panel'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Current pathname:', pathname);
  
  // Get auth token from cookies
  const authToken = request.cookies.get('access_token');
  console.log('Auth token present:', !!authToken?.value);
  console.log('Request URL:', request.url);

  // Handle root path
  if (pathname === '/') {
    console.log('Handling root path navigation');
    if (authToken?.value) {
      try {
        const payload = parseJwt(authToken.value);
        const targetPath = payload?.admin ? '/admin-dashboard' : '/user-panel';
        const redirectUrl = new URL(targetPath, request.url);
        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        console.log('Error parsing JWT at root path:', error);
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // If user is authenticated and tries to access auth pages, redirect to appropriate dashboard
  if (authToken?.value && authPaths.includes(pathname)) {
    console.log('Authenticated user attempting to access auth page:', pathname);
    try {
      const payload = parseJwt(authToken.value);
      const targetPath = payload?.admin ? '/admin-dashboard' : '/user-panel';
      console.log('Auth page redirect:', { from: pathname, to: targetPath, isAdmin: payload?.admin });
      const redirectUrl = new URL(targetPath, request.url);
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.log('Error parsing JWT at auth path:', error);
      return NextResponse.next();
    }
  }

  // Allow public paths without authentication
  if (publicPaths.includes(pathname)) {
    console.log('Allowing access to public path:', pathname);
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!authToken?.value && !publicPaths.includes(pathname) && !authPaths.includes(pathname)) {
    console.log('Unauthorized access attempt:', { path: pathname, redirectingTo: '/sign-in' });
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Verify user roles and access
  if (authToken?.value) {
    try {
      const payload = parseJwt(authToken.value);
      
      // Prevent admin users from accessing user panel
      if (userPaths.includes(pathname) && payload?.admin) {
        console.log('Admin attempted to access user path:', { path: pathname, redirectingTo: '/admin-dashboard' });
        const adminDashboardUrl = new URL('/admin-dashboard', request.url);
        return NextResponse.redirect(adminDashboardUrl);
      }

      // Prevent regular users from accessing admin routes
      if (adminPaths.includes(pathname) && !payload?.admin) {
        console.log('Regular user attempted to access admin path:', { path: pathname, redirectingTo: '/user-panel' });
        const userPanelUrl = new URL('/user-panel', request.url);
        return NextResponse.redirect(userPanelUrl);
      }

      console.log('Access granted to protected path:', { path: pathname, userRole: payload?.admin ? 'admin' : 'user' });
    } catch (error) {
      console.log('Error verifying user access:', { path: pathname, error });
      const signInUrl = new URL('/sign-in', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// Parse JWT token
function parseJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    console.log('Decoded payload:', payload);
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