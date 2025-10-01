'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { auditApi } from '@/lib/auditApi';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuToggle, isMobileMenuOpen }) => {
  const { t } = useTranslation(['common', 'audit']);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  useOutsideClick(notificationRef, () => setShowNotifications(false), showNotifications);

  useEffect(() => {
    if (showNotifications) {
      setAuditLoading(true);
      auditApi.getRecentLogs(5)
        .then((logs) => setAuditLogs(logs.data || logs))
        .catch(() => setAuditError(t('dashboard.errorLoadingAuditLogs')))
        .finally(() => setAuditLoading(false));
    }
  }, [showNotifications]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="layout-stable fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white/85 backdrop-blur-xl border-b border-secondary-200/50 shadow-soft">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Toggle and Logo */}
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo - Hidden on desktop since sidebar shows it */}
            <div className="flex lg:hidden items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-medium animate-bounce-gentle">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">Flotix</h1>
            </div>
          </div>


          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher - Hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                className="p-2 sm:p-2.5 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-medium group"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="w-5 h-5 group-hover:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A6.5 6.5 0 0118 10c0-3.314-2.686-6-6-6s-6 2.686-6 6a6.5 6.5 0 001.405 4.595L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent-500 rounded-full animate-pulse"></div>
              {/* Dropdown Notification */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-xl shadow-large border border-secondary-200/50 py-2 z-50">
                  <div className="px-4 py-2 border-b border-secondary-100">
                    <span className="font-semibold text-secondary-900">{t('dashboard.auditLogNotifications')}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {auditLoading ? (
                      <div className="flex items-center justify-center py-6 text-secondary-400">{t('messages.loading')}</div>
                    ) : auditError ? (
                      <div className="text-red-500 px-4 py-2">{auditError}</div>
                    ) : auditLogs.length === 0 ? (
                      <div className="px-4 py-6 text-secondary-400 text-center">{t('dashboard.noRecentAuditLogs')}</div>
                    ) : (
                      <ul className="divide-y divide-secondary-100">
                        {auditLogs.map((log) => {
                          const date = new Date(log.timestamp);
                          const translatedAction = t(`audit:actions.${log.action}`, { defaultValue: log.action });
                          const translatedModule = t(`audit:modules.${log.module}`, { defaultValue: log.module });

                          // Translate details from backend
                          let translatedDetails = log.details || `${translatedAction} ${translatedModule}`;

                          // Parse backend messages and translate them
                          if (log.details) {
                            const email = log.details.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';

                            if (log.details.includes('Failed login attempt') && log.details.includes('Account inactive')) {
                              translatedDetails = `${t('audit:details.failed_login_inactive')}: ${email}`;
                            } else if (log.details.includes('Failed login attempt') && log.details.includes('Invalid password')) {
                              translatedDetails = `${t('audit:details.failed_login_password')}: ${email}`;
                            } else if (log.details.startsWith('User login:')) {
                              translatedDetails = `${t('audit:details.user_login')}: ${email}`;
                            }
                          }

                          return (
                            <li key={log._id} className="py-3 px-4 flex flex-col gap-1 hover:bg-secondary-50 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-secondary-900">{typeof log.userId === 'object' && log.userId?.name ? log.userId.name : t('dashboard.unknownUser')}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-secondary-100 text-secondary-700">{translatedAction}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">{translatedModule}</span>
                              </div>
                              <div className="text-xs text-secondary-500">{translatedDetails}</div>
                              <div className="text-xs text-secondary-400">{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="border-t border-secondary-100 px-4 py-2 text-right">
                    <Link href="/audit" className="text-primary-600 hover:underline text-sm">{t('dashboard.viewAll')}</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl hover:bg-secondary-100/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:shadow-medium group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-semibold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-secondary-900">
                      {user.name || 'No Name'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {user.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  <svg
                    className={cn(
                      "w-4 h-4 text-secondary-400 transition-transform hidden sm:block",
                      showDropdown && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-xl shadow-large border border-secondary-200/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-medium">
                          <span className="text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary-900">{user.name || 'No Name'}</p>
                          <p className="text-xs text-secondary-500">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('dashboard.profileSettings')}
                      </Link>
                    </div>

                    <div className="border-t border-secondary-100 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-accent-600 hover:bg-accent-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {loading ? t('dashboard.signingOut') : t('dashboard.signOut')}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Overlay to close dropdown */}
                {showDropdown && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button>{t('auth.signIn')}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    
    </header>
  );
};

export default Header;