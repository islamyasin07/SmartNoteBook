import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { role } = useAuth();
  return useMemo(() => ({
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isViewer: role === 'viewer',
    canEdit: role === 'admin' || role === 'staff',
    canDelete: role === 'admin',
    canExport: role === 'admin'
  }), [role]);
};