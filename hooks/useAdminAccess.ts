/**
 * useAdminAccess Hook
 *
 * Custom React hook to check if the current authenticated user has admin privileges.
 * Checks for 'role: admin' in the user's Clerk public metadata.
 *
 * @returns {Object} - { isAdmin: boolean, isLoading: boolean }
 */

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface AdminAccessState {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdminAccess(): AdminAccessState {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Check for admin role in public metadata
      const publicMetadata = user.publicMetadata as { role?: string } | undefined;
      const adminStatus = publicMetadata?.role === 'admin';
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }
  }, [user, isLoaded]);

  return {
    isAdmin,
    isLoading: !isLoaded,
  };
}
