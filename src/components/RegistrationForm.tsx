'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification({ show: false, type: 'success', message: '' }); // Clear any existing notifications

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      email: formData.get('email') as string,
      company: formData.get('company') as string || undefined,
      message: formData.get('message') as string || undefined
    };

    try {
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://your-backend-url.com' : 'http://localhost:3001'}/api/register-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification('success', 'Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.');
        form.reset();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          showNotification('error', 'Diese E-Mail-Adresse wurde bereits registriert.');
        } else {
          showNotification('error', 'Fehler beim Senden. Bitte versuchen Sie es erneut.');
        }
      }
    } catch (error) {
      showNotification('error', 'Fehler beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl max-w-2xl mx-auto hover:bg-white/10 transition-all duration-500">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-auto text-current hover:opacity-70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none disabled:opacity-50 text-white placeholder-white/60 backdrop-blur-sm"
            placeholder="ihre.email@unternehmen.de"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-white/90 mb-2">
            Unternehmen (optional)
          </label>
          <input
            type="text"
            name="company"
            id="company"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none disabled:opacity-50 text-white placeholder-white/60 backdrop-blur-sm"
            placeholder="Ihr Unternehmen"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
            Nachricht (optional)
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none disabled:opacity-50 text-white placeholder-white/60 backdrop-blur-sm resize-none"
            placeholder="Erzählen Sie uns von Ihrer Flotte und Ihren Anforderungen..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Wird gesendet...
            </>
          ) : (
            <>
              Portal-Zugang anfordern
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">
          Wir antworten normalerweise innerhalb von 24 Stunden
        </p>
      </div>
    </div>
  );
}