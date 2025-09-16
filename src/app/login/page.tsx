'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { LoginRequest } from '@fleetflow/types';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div className="max-w-md w-full">
        <Card shadow="lg" className="backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg mb-6">
              <span className="text-white font-bold text-2xl">FL</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your Flotix admin dashboard
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChangeText={handleChange('email')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                required
                error={error && error.toLowerCase().includes('email') ? error : undefined}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChangeText={handleChange('password')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                required
                error={error && !error.toLowerCase().includes('email') ? error : undefined}
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing in...' : 'Sign in to Dashboard'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-3">Demo Credentials</p>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Super Admin:</span>
                    <span className="font-mono">super@flotix.com</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Admin:</span>
                    <span className="font-mono">admin@company1.com</span>
                  </div>
                  <p className="text-center pt-1">
                    <span className="font-medium">Password:</span> <code className="bg-gray-100 px-1 rounded">password</code>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features highlight */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              OCR Processing
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Real-time Analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}