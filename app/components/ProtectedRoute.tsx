'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (adminOnly && !user?.admin) {
        router.push('/user-panel'); // Redirect non-admin users from admin-only pages to user panel
      }
    }
  }, [isAuthenticated, loading, router, adminOnly, user]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500'></div>
      </div>
    );
  }

  // If not authenticated or if admin-only page and user is not admin, don't render children
  if (!isAuthenticated || (adminOnly && !user?.admin)) {
    return null;
  }

  return <>{children}</>;
}
