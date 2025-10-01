import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung - Flotix',
  description: 'Datenschutzerklärung und Informationen zum Umgang mit personenbezogenen Daten bei Flotix',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Flotix</h1>
                <p className="text-xs text-gray-500">Fleet Expense Management</p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                Stand: {new Date().toLocaleDateString('de-DE')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Verantwortlicher</h2>
                <p className="text-gray-700 mb-4">
                  Verantwortlicher für die Datenverarbeitung auf dieser Website ist:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800 font-medium">Flotix GmbH</p>
                  <p className="text-gray-700">Musterstraße 123</p>
                  <p className="text-gray-700">12345 Musterstadt</p>
                  <p className="text-gray-700">Deutschland</p>
                  <p className="text-gray-700 mt-2">E-Mail: datenschutz@flotix.com</p>
                  <p className="text-gray-700">Telefon: +49 (0) 123 456789</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
                <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Beim Besuch der Website</h3>
                <p className="text-gray-700 mb-4">
                  Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser
                  automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden
                  temporär in einem sogenannten Logfile gespeichert.
                </p>
                <p className="text-gray-700 mb-4">Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Bei der Nutzung unserer Anwendung</h3>
                <p className="text-gray-700 mb-4">
                  Zur Nutzung unserer Fleet-Management-Anwendung ist eine Registrierung erforderlich.
                  Dabei erheben wir folgende Daten:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Name und Vorname</li>
                  <li>E-Mail-Adresse</li>
                  <li>Passwort (verschlüsselt gespeichert)</li>
                  <li>Unternehmensinformationen</li>
                  <li>Fahrzeugdaten</li>
                  <li>Ausgabeninformationen und Belege</li>
                  <li>GPS-Daten (nur bei Zustimmung in der mobilen App)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Zweck der Datenverarbeitung</h2>
                <p className="text-gray-700 mb-4">Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Bereitstellung und Betrieb der Fleet-Management-Software</li>
                  <li>Verwaltung von Fahrzeugdaten und Ausgaben</li>
                  <li>OCR-Verarbeitung von Belegen zur automatisierten Datenerfassung</li>
                  <li>Erstellung von Berichten und Analysen</li>
                  <li>Kundensupport und technische Wartung</li>
                  <li>Abrechnung und Rechnungsstellung</li>
                  <li>Kommunikation mit Nutzern</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Rechtsgrundlage für die Datenverarbeitung</h2>
                <p className="text-gray-700 mb-4">
                  Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage der folgenden Rechtsgrundlagen:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Verarbeitung zur Erfüllung eines Vertrags</li>
                  <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Verarbeitung aufgrund Ihrer Einwilligung</li>
                  <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Verarbeitung zur Wahrung berechtigter Interessen</li>
                  <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Verarbeitung zur Erfüllung rechtlicher Verpflichtungen</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Weitergabe von Daten</h2>
                <p className="text-gray-700 mb-4">
                  Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden aufgeführten
                  Zwecken findet nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben</li>
                  <li>die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist</li>
                  <li>die Weitergabe zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist</li>
                  <li>dies gesetzlich zulässig und zur Abwicklung von Vertragsverhältnissen erforderlich ist</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Auftragsverarbeiter</h3>
                <p className="text-gray-700 mb-4">
                  Wir setzen externe Dienstleister ein, die in unserem Auftrag personenbezogene Daten verarbeiten:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Cloud-Hosting:</strong> Für den Betrieb unserer Server und Datenbanken</li>
                  <li><strong>OpenAI:</strong> Für die OCR-Verarbeitung von Belegen</li>
                  <li><strong>Firebase Storage:</strong> Für die Speicherung von Belegbildern</li>
                  <li><strong>E-Mail-Service:</strong> Für den Versand von System-E-Mails</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Dauer der Speicherung</h2>
                <p className="text-gray-700 mb-4">
                  Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung der
                  Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Nutzerdaten:</strong> Bis zur Löschung des Nutzerkontos</li>
                  <li><strong>Ausgabendaten:</strong> 10 Jahre (steuerrechtliche Aufbewahrungspflicht)</li>
                  <li><strong>Audit-Logs:</strong> 2 Jahre</li>
                  <li><strong>Server-Logs:</strong> 30 Tage</li>
                  <li><strong>Belegbilder:</strong> 10 Jahre oder bis zur Löschung durch den Nutzer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Ihre Rechte</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)</li>
                  <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
                  <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
                  <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                  <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                  <li><strong>Recht auf Widerspruch</strong> (Art. 21 DSGVO)</li>
                  <li><strong>Recht auf Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter: datenschutz@flotix.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Datensicherheit</h2>
                <p className="text-gray-700 mb-4">
                  Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten
                  gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder vollständigen Verlust,
                  Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                  <li>Verschlüsselte Speicherung von Passwörtern</li>
                  <li>Regelmäßige Sicherheitsupdates</li>
                  <li>Zugriffskontrolle und Berechtigungsmanagement</li>
                  <li>Regelmäßige Backups</li>
                  <li>Monitoring und Audit-Logging</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät
                  gespeichert werden. Wir verwenden folgende Arten von Cookies:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Technisch notwendige Cookies:</strong> Für die Grundfunktionen der Website</li>
                  <li><strong>Authentifizierungs-Cookies:</strong> Für die Anmeldung und Sitzungsverwaltung</li>
                  <li><strong>Präferenz-Cookies:</strong> Für Spracheinstellungen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Sie können Ihre Browser-Einstellungen entsprechend konfigurieren und z.B. die Annahme von
                  Third-Party-Cookies oder allen Cookies ablehnen. Wir weisen Sie darauf hin, dass Sie
                  eventuell nicht alle Funktionen dieser Website nutzen können.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Beschwerderecht</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über unsere Verarbeitung
                  personenbezogener Daten zu beschweren. Die für uns zuständige Aufsichtsbehörde ist:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800 font-medium">Bundesbeauftragte für den Datenschutz und die Informationsfreiheit</p>
                  <p className="text-gray-700">Graurheindorfer Str. 153</p>
                  <p className="text-gray-700">53117 Bonn</p>
                  <p className="text-gray-700 mt-2">Telefon: +49 (0) 228 997799-0</p>
                  <p className="text-gray-700">E-Mail: poststelle@bfdi.bund.de</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Änderungen dieser Datenschutzerklärung</h2>
                <p className="text-gray-700 mb-4">
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
                  rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
                  Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontakt</h2>
                <p className="text-gray-700 mb-4">
                  Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten, bei
                  Auskünften, Berichtigung, Sperrung oder Löschung von Daten wenden Sie sich bitte an:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 font-medium">Datenschutzbeauftragter</p>
                  <p className="text-gray-700">Flotix GmbH</p>
                  <p className="text-gray-700">E-Mail: datenschutz@flotix.com</p>
                  <p className="text-gray-700">Telefon: +49 (0) 123 456789</p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-700">
              Zur Anmeldung
            </Link>
            <span>•</span>
            <Link href="/impressum" className="hover:text-gray-700">
              Impressum
            </Link>
            <span>•</span>
            <span>© 2024 Flotix GmbH</span>
          </div>
        </footer>
      </main>
    </div>
  );
}