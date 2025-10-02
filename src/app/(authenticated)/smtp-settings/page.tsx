'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

interface SmtpSettings {
  _id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  testEmailSent?: boolean;
  lastTestedAt?: string;
}

export default function SmtpSettingsPage() {
  const [settings, setSettings] = useState<SmtpSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Flotix Fleet Management',
  });

  useEffect(() => {
    loadSmtpSettings();
  }, []);

  const loadSmtpSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/smtp-settings');

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings(data);
        setFormData({
          host: data.host,
          port: data.port,
          secure: data.secure,
          username: data.username,
          password: '', // Don't populate password for security
          fromEmail: data.fromEmail,
          fromName: data.fromName,
        });
      }
    } catch (err: any) {
      console.error('Failed to load SMTP settings:', err);
      setError(err.response?.data?.message || 'Failed to load SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/smtp-settings', formData);

      if (response.data.success) {
        setSuccess('SMTP settings saved successfully!');
        setSettings(response.data.data);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter a test email address');
      return;
    }

    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/smtp-settings/test', { testEmail });

      if (response.data.success) {
        setSuccess(`Test email sent successfully to ${testEmail}! Check your inbox.`);
        await loadSmtpSettings(); // Reload to update test status
        setTimeout(() => setSuccess(''), 10000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading SMTP settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email SMTP Settings</h1>
        <p className="text-gray-600 mt-2">Configure email server settings to send automated emails</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Current Status */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Status</span>
              {settings.testEmailSent && (
                <span className="text-sm font-normal text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tested Successfully
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">SMTP Host</p>
                <p className="font-semibold text-gray-900">{settings.host}:{settings.port}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">From Email</p>
                <p className="font-semibold text-gray-900">{settings.fromEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Security</p>
                <p className="font-semibold text-gray-900">{settings.secure ? 'SSL/TLS (Port 465)' : 'STARTTLS (Port 587)'}</p>
              </div>
              {settings.lastTestedAt && (
                <div>
                  <p className="text-sm text-gray-600">Last Tested</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(settings.lastTestedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMTP Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., smtp.gmail.com, smtp.office365.com</p>
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="587"
                />
                <p className="text-xs text-gray-500 mt-1">Port 587 (STARTTLS) or 465 (SSL/TLS)</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your-email@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!settings} // Required only for new settings
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder={settings ? 'Leave blank to keep existing' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use app password for Gmail/Office365</p>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="noreply@yourcompany.com"
                />
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Flotix Fleet Management"
                />
              </div>
            </div>

            {/* Security Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="secure"
                checked={formData.secure}
                onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="secure" className="text-sm text-gray-700">
                <strong>Use SSL/TLS (Port 465)</strong>
                <p className="text-xs text-gray-500">Enable for port 465, disable for port 587 (STARTTLS)</p>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save SMTP Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Email */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Test Email Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Send a test email to verify your SMTP configuration is working correctly.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email address to receive test email"
              />
              <Button onClick={handleTestEmail} disabled={testing || !testEmail} variant="outline">
                {testing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular SMTP Providers Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Common SMTP Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gmail */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Gmail</h4>
                <p className="text-sm text-gray-600 mb-2">Host: smtp.gmail.com</p>
                <p className="text-sm text-gray-600 mb-2">Port: 587 (TLS)</p>
                <p className="text-xs text-gray-500">Use App Password, not regular password</p>
              </div>

              {/* Office 365 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Office 365</h4>
                <p className="text-sm text-gray-600 mb-2">Host: smtp.office365.com</p>
                <p className="text-sm text-gray-600 mb-2">Port: 587 (TLS)</p>
                <p className="text-xs text-gray-500">Use your Microsoft account</p>
              </div>

              {/* SendGrid */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">SendGrid</h4>
                <p className="text-sm text-gray-600 mb-2">Host: smtp.sendgrid.net</p>
                <p className="text-sm text-gray-600 mb-2">Port: 587 (TLS)</p>
                <p className="text-xs text-gray-500">Username: apikey</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">📧 Email Usage</h4>
              <p className="text-sm text-blue-700">Once configured, the system will automatically send:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-5 list-disc">
                <li>Welcome emails with login credentials to new users</li>
                <li>Password reset links</li>
                <li>System notifications and alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
