'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(credentials);
      console.log('Login successful:', response);
      // Redirect based on user role - Allow web access for admin roles and custom role users
      if (response.user.role === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else if (response.user.role === 'ADMIN') {
        router.push('/dashboard');
      } else if (response.user.role === 'MANAGER') {
        router.push('/dashboard');
      } else if (response.user.role === 'VIEWER') {
        router.push('/dashboard');
      } else if (response.user.role === 'DRIVER') {
        // For DRIVER role, check if they have custom roles (this indicates web access)
        // We'll fetch their permissions to verify web access
        try {
          const userDetails = await authApi.getMe();
          // Allow access - custom role permissions will be checked at the API level
          router.push('/dashboard');
        } catch {
          setError('Web access is only available for Admin users');
        }
      } else {
        setError('Web access is only available for Admin users');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginRequest) => (value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl w-full">
        <Card shadow="lg" className="backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-white shadow-lg mb-6 p-2">
              <img
                src="/logo.svg"
                alt="Flotix Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-gray-600">
              {t('auth.signInToDashboard')}
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      {t('auth.loginFailed')}
                    </h3>
                    <p className="text-sm text-red-700">
                      {t('auth.wrongEmailPassword')}
                    </p>
                  </div>
                </div>
              )}
              <Input
                label={t('auth.emailAddress')}
                type="email"
                placeholder={t('auth.enterEmail')}
                value={credentials.email}
                onChangeText={handleChange('email')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                required
              />

              <Input
                label={t('auth.password')}
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.enterPassword')}
                value={credentials.password}
                onChangeText={handleChange('password')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )
                }
                rightIconClickable={true}
                onRightIconClick={() => setShowPassword(!showPassword)}
                required
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Features highlight */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('auth.ocrProcessing')}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('auth.realTimeAnalytics')}
            </div>
          </div>
        </div>

        {/* Legal Links Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <Link href="/impressum" className="hover:text-gray-700 transition-colors">
              {t('auth.impressum')}
            </Link>
            <span>•</span>
            <Link href="/datenschutz" className="hover:text-gray-700 transition-colors">
              {t('auth.datenschutz')}
            </Link>
            <span>•</span>
            <span>{t('auth.copyright')}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}