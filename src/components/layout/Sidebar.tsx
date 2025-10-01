'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  current?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ items, className, userRole }) => {
  const pathname = usePathname();
  const { t } = useTranslation('sidebar');

  return (
    <div className={cn("layout-stable fixed left-0 top-0 z-40 w-64 h-screen bg-white/95 backdrop-blur-xl border-r border-secondary-200/50 shadow-large", className)}>
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/20 via-transparent to-primary-100/20 pointer-events-none"></div>
      
      {/* Logo Section */}
      <div className="relative flex items-center px-6 py-5 border-b border-secondary-100/50">
        <Link href={userRole === 'SUPER_ADMIN' ? '/dashboard/super-admin' : '/dashboard/admin'} className="group flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-medium p-1">
            <img
              src="/logo.svg"
              alt="Flotix Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary-900 group-hover:text-primary-700">{t('branding.title')}</h1>
            <p className="text-xs text-secondary-500 group-hover:text-secondary-600">{t('branding.subtitle')}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative px-4 py-6">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-primary-50/30 hover:shadow-soft"
                  )}
                >
                  <span
                    className={cn(
                      "mr-4 flex-shrink-0",
                      isActive ? "text-white" : "text-secondary-400 group-hover:text-primary-600 group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">
                    {userRole === 'SUPER_ADMIN'
                      ? t(`superAdmin.${item.name}`, item.name)
                      : t(`admin.${item.name}`, item.name)}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      <span className="w-1 h-1 bg-white/70 rounded-full"></span>
                    </div>
                  )}
                  
                  {/* Hover shimmer effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-shimmer bg-[length:200%_100%] opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-100/50">
        <div className="group bg-gradient-to-r from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 rounded-xl p-4 hover:shadow-soft cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 shadow-soft group-hover:shadow-medium">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary-900 group-hover:text-secondary-800">Need Help?</p>
              <button className="text-xs text-primary-600 hover:text-primary-700 group-hover:text-primary-800 font-medium">Contact Support</button>
            </div>
          </div>
          
          <div className="absolute top-1 right-1 w-1 h-1 bg-primary-300 rounded-full opacity-0 group-hover:opacity-100"></div>
          <div className="absolute bottom-1 right-3 w-0.5 h-0.5 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100"></div>
        </div>
      </div> */}
    </div>
  );
};

// Default sidebar items for admin
export const adminSidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Drivers',
    href: '/drivers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Vehicles',
    href: '/vehicles',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  /* HIDDEN: Reports functionality - Re-enable when backend ready
  {
    name: 'Reports',
    href: '/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  }, */
  {
    name: 'Audit Logs',
    href: '/audit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Role Management',
    href: '/role-management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: 'User Management',
    href: '/user-management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

// Super admin sidebar items - only Dashboard, Companies, and System Users
export const superAdminSidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/super-admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Role Management',
    href: '/role-management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: 'User Management',
    href: '/user-management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'System Users',
    href: '/system-users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default Sidebar;