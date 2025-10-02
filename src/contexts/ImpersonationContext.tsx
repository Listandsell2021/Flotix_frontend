'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ImpersonationState {
  isImpersonating: boolean;
  originalUser: {
    name: string;
    email: string;
    role: string;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  } | null;
  impersonatedCompany: {
    _id: string;
    name: string;
  } | null;
}

interface ImpersonationContextType extends ImpersonationState {
  startImpersonation: (companyId: string, companyName: string, adminData: AdminUserData) => void;
  endImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const STORAGE_KEY = 'flotix_impersonation_state';

interface AdminUserData {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalUser: null,
    impersonatedCompany: null,
  });

  // Load impersonation state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setState(parsed);
        } catch (error) {
          console.error('Failed to parse impersonation state:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save impersonation state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (state.isImpersonating) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [state]);

  const startImpersonation = (companyId: string, companyName: string, adminData: AdminUserData) => {
    // Save current super admin state
    const currentAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    if (!currentAccessToken || !currentRefreshToken) {
      console.error('Cannot start impersonation: Missing current tokens');
      alert('Authentication error: Please refresh the page and try again');
      return;
    }

    // Try to get current user from localStorage, or use a placeholder
    let currentUser = { name: 'Super Admin', email: 'superadmin@example.com', role: 'SUPER_ADMIN' };
    try {
      const currentUserStr = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      if (currentUserStr) {
        currentUser = JSON.parse(currentUserStr);
      }
    } catch (error) {
      console.warn('Could not parse current user, using defaults:', error);
    }

    // Save original super admin data
    const newState: ImpersonationState = {
      isImpersonating: true,
      originalUser: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        tokens: {
          accessToken: currentAccessToken,
          refreshToken: currentRefreshToken,
        },
      },
      impersonatedCompany: {
        _id: companyId,
        name: companyName,
      },
    };

    setState(newState);

    // Switch to admin tokens and save admin user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', adminData.tokens.accessToken);
      localStorage.setItem('refreshToken', adminData.tokens.refreshToken);
      // Save the admin user data so the app knows who is logged in
      localStorage.setItem('currentUser', JSON.stringify(adminData.user));

      // Dispatch custom event to notify layout of user change
      window.dispatchEvent(new CustomEvent('userChanged'));
    }

    // Redirect to admin dashboard
    router.push('/dashboard/admin');

    // Force page reload to apply new tokens
    setTimeout(() => {
      window.location.href = '/dashboard/admin';
    }, 100);
  };

  const endImpersonation = () => {
    if (!state.originalUser) {
      console.error('Cannot end impersonation: No original user data');
      return;
    }

    // Restore original super admin tokens and user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', state.originalUser.tokens.accessToken);
      localStorage.setItem('refreshToken', state.originalUser.tokens.refreshToken);
      // Restore original user data
      localStorage.setItem('currentUser', JSON.stringify({
        name: state.originalUser.name,
        email: state.originalUser.email,
        role: state.originalUser.role,
      }));

      // Dispatch custom event to notify layout of user change
      window.dispatchEvent(new CustomEvent('userChanged'));
    }

    // Clear impersonation state
    setState({
      isImpersonating: false,
      originalUser: null,
      impersonatedCompany: null,
    });

    // Redirect back to super admin dashboard
    router.push('/dashboard/super-admin');

    // Force page reload to apply original tokens
    setTimeout(() => {
      window.location.href = '/dashboard/super-admin';
    }, 100);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        ...state,
        startImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
}
