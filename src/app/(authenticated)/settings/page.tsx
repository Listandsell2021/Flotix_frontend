'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

// Tab type
type TabType = 'general' | 'smtp' | 'templates' | 'advanced';

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

interface SystemSettings {
  _id?: string;
  // Basic Settings
  appName: string;
  appLogo?: string;
  supportEmail: string;
  supportPhone?: string;

  // Expense Settings
  expenseEditWindow: number;
  maxExpenseAmount: number;
  requireReceiptImage: boolean;
  autoApproveExpenses: boolean;

  // OCR Settings
  ocrEnabled: boolean;
  ocrConfidenceThreshold: number;
  ocrProvider: 'openai' | 'google' | 'aws';

  // File Upload Settings
  maxFileSize: number;
  allowedFileTypes: string[];

  // Security Settings
  sessionTimeout: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number;

  // Notification Settings
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;

  // Currency & Localization
  defaultCurrency: string;
  defaultLanguage: string;
  defaultTimezone: string;
  dateFormat: string;

  // Feature Flags
  enableMobileApp: boolean;
  enableReports: boolean;
  enableAuditLogs: boolean;
  enableMultiCompany: boolean;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage?: string;

  // Email Templates
  adminWelcomeEmailSubject: string;
  adminWelcomeEmailBody: string;
  driverWelcomeEmailSubject: string;
  driverWelcomeEmailBody: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Refs for email template textareas
  const adminBodyRef = useRef<HTMLTextAreaElement>(null);
  const driverBodyRef = useRef<HTMLTextAreaElement>(null);

  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [smtpFormData, setSmtpFormData] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Flotix Fleet Management',
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: 'Flotix',
    supportEmail: 'support@flotix.com',
    supportPhone: '',
    expenseEditWindow: 168,
    maxExpenseAmount: 100000,
    requireReceiptImage: true,
    autoApproveExpenses: false,
    ocrEnabled: true,
    ocrConfidenceThreshold: 0.7,
    ocrProvider: 'openai',
    maxFileSize: 5,
    allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    sessionTimeout: 60,
    passwordMinLength: 6,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    defaultCurrency: 'EUR',
    defaultLanguage: 'en',
    defaultTimezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    enableMobileApp: true,
    enableReports: true,
    enableAuditLogs: true,
    enableMultiCompany: true,
    maintenanceMode: false,
    maintenanceMessage: '',
    adminWelcomeEmailSubject: 'Welcome to Flotix - Your Admin Account',
    adminWelcomeEmailBody: '',
    driverWelcomeEmailSubject: 'Welcome to Flotix - Driver Account Created',
    driverWelcomeEmailBody: '',
  });

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSmtpSettings(), loadSystemSettings()]);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSmtpSettings = async () => {
    try {
      const response = await api.get('/smtp-settings');
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSmtpSettings(data);
        setSmtpFormData({
          host: data.host,
          port: data.port,
          secure: data.secure,
          username: data.username,
          password: '',
          fromEmail: data.fromEmail,
          fromName: data.fromName,
        });
      }
    } catch (err) {
      console.error('Failed to load SMTP settings:', err);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const response = await api.get('/system-settings');
      if (response.data.success && response.data.data) {
        setSystemSettings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
    }
  };

  const saveSmtpSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/smtp-settings', smtpFormData);
      if (response.data.success) {
        setSuccess('SMTP settings saved successfully!');
        setSmtpSettings(response.data.data);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/system-settings', systemSettings);
      if (response.data.success) {
        setSuccess('System settings saved successfully!');
        setSystemSettings(response.data.data);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save system settings');
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
        setSuccess(`Test email sent successfully to ${testEmail}!`);
        await loadSmtpSettings();
        setTimeout(() => setSuccess(''), 10000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  // Insert variable into email template at cursor position
  const insertVariable = (variable: string, templateType: 'admin' | 'driver') => {
    const textarea = templateType === 'admin' ? adminBodyRef.current : driverBodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = templateType === 'admin'
      ? systemSettings.adminWelcomeEmailBody
      : systemSettings.driverWelcomeEmailBody;

    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

    if (templateType === 'admin') {
      setSystemSettings({ ...systemSettings, adminWelcomeEmailBody: newValue });
    } else {
      setSystemSettings({ ...systemSettings, driverWelcomeEmailBody: newValue });
    }

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const tabs = [
    {
      id: 'general',
      name: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'smtp',
      name: 'Email (SMTP)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'templates',
      name: 'Email Templates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure and manage all system settings from one place</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2 inline-flex">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); saveSystemSettings(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={systemSettings.appName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={systemSettings.supportEmail}
                      onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={systemSettings.supportPhone || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, supportPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Spinner size="sm" className="mr-2" />Saving...</> : 'Save General Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* SMTP Settings Tab */}
        {activeTab === 'smtp' && (
          <div className="space-y-6">
            {/* Current Status */}
            {smtpSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Status</span>
                    {smtpSettings.testEmailSent && (
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
                      <p className="font-semibold text-gray-900">{smtpSettings.host}:{smtpSettings.port}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">From Email</p>
                      <p className="font-semibold text-gray-900">{smtpSettings.fromEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Security</p>
                      <p className="font-semibold text-gray-900">{smtpSettings.secure ? 'SSL/TLS (Port 465)' : 'STARTTLS (Port 587)'}</p>
                    </div>
                    {smtpSettings.lastTestedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Last Tested</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(smtpSettings.lastTestedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SMTP Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); saveSmtpSettings(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={smtpFormData.host}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, host: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={smtpFormData.port}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, port: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={smtpFormData.username}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, username: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!smtpSettings}
                          value={smtpFormData.password}
                          onChange={(e) => setSmtpFormData({ ...smtpFormData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          placeholder={smtpSettings ? 'Leave blank to keep existing' : 'Enter password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={smtpFormData.fromEmail}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, fromEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={smtpFormData.fromName}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, fromName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={smtpFormData.secure}
                      onChange={(e) => setSmtpFormData({ ...smtpFormData, secure: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="secure" className="text-sm text-gray-700">
                      Use SSL/TLS (Port 465)
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? <><Spinner size="sm" className="mr-2" />Saving...</> : 'Save SMTP Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Test Email */}
            {smtpSettings && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Email Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter email to receive test"
                    />
                    <Button onClick={handleTestEmail} disabled={testing || !testEmail} variant="outline">
                      {testing ? <><Spinner size="sm" className="mr-2" />Sending...</> : 'Send Test Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <form onSubmit={(e) => { e.preventDefault(); saveSystemSettings(); }} className="space-y-6">
            {/* Admin Welcome Email Template */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Welcome Email</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Email sent to new Admin users when their account is created</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Available Variables (Click to Insert):</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-blue-800">
                      <code
                        onClick={() => insertVariable('{{userName}}', 'admin')}
                        className="bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{userName}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{userEmail}}', 'admin')}
                        className="bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{userEmail}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{password}}', 'admin')}
                        className="bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{password}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{companyName}}', 'admin')}
                        className="bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{companyName}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{loginUrl}}', 'admin')}
                        className="bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{loginUrl}}'}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={systemSettings.adminWelcomeEmailSubject}
                      onChange={(e) => setSystemSettings({ ...systemSettings, adminWelcomeEmailSubject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Welcome to Flotix - Your Admin Account"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Body (HTML Template)
                    </label>
                    <div className="relative">
                      <textarea
                        ref={adminBodyRef}
                        value={systemSettings.adminWelcomeEmailBody}
                        onChange={(e) => setSystemSettings({ ...systemSettings, adminWelcomeEmailBody: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-xs bg-gray-50"
                        placeholder="Enter HTML template with variables like {{userName}}, {{userEmail}}, etc."
                        spellCheck={false}
                      />
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        HTML
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 This is an HTML template. Click on variables above to insert them at cursor position.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Welcome Email Template */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Welcome Email</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Email sent to new Driver users when their account is created</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Available Variables (Click to Insert):</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-green-800">
                      <code
                        onClick={() => insertVariable('{{userName}}', 'driver')}
                        className="bg-green-100 px-2 py-1 rounded cursor-pointer hover:bg-green-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{userName}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{userEmail}}', 'driver')}
                        className="bg-green-100 px-2 py-1 rounded cursor-pointer hover:bg-green-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{userEmail}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{password}}', 'driver')}
                        className="bg-green-100 px-2 py-1 rounded cursor-pointer hover:bg-green-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{password}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{companyName}}', 'driver')}
                        className="bg-green-100 px-2 py-1 rounded cursor-pointer hover:bg-green-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{companyName}}'}
                      </code>
                      <code
                        onClick={() => insertVariable('{{appDownloadUrl}}', 'driver')}
                        className="bg-green-100 px-2 py-1 rounded cursor-pointer hover:bg-green-200 transition-colors"
                        title="Click to insert"
                      >
                        {'{{appDownloadUrl}}'}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={systemSettings.driverWelcomeEmailSubject}
                      onChange={(e) => setSystemSettings({ ...systemSettings, driverWelcomeEmailSubject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Welcome to Flotix - Driver Account Created"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Body (HTML Template)
                    </label>
                    <div className="relative">
                      <textarea
                        ref={driverBodyRef}
                        value={systemSettings.driverWelcomeEmailBody}
                        onChange={(e) => setSystemSettings({ ...systemSettings, driverWelcomeEmailBody: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-xs bg-gray-50"
                        placeholder="Enter HTML template with variables like {{userName}}, {{userEmail}}, etc."
                        spellCheck={false}
                      />
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        HTML
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 This is an HTML template. Click on variables above to insert them at cursor position.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <><Spinner size="sm" className="mr-2" />Saving...</> : 'Save Email Templates'}
              </Button>
            </div>
          </form>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); saveSystemSettings(); }} className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Maintenance Mode</h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    When enabled, only Super Admins can access the system. All other users will see a maintenance message.
                  </p>

                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenance" className="text-sm font-medium text-gray-900">
                      Enable Maintenance Mode
                    </label>
                  </div>

                  {systemSettings.maintenanceMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Message
                      </label>
                      <textarea
                        value={systemSettings.maintenanceMessage || ''}
                        onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMessage: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="We're currently performing system maintenance. Please check back soon."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Spinner size="sm" className="mr-2" />Saving...</> : 'Save Advanced Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
