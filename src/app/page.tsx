import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Truck,
  Smartphone,
  ScanText,
  BarChart3,
  Shield,
  Clock,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  DollarSign,
  User,
  Receipt,
  Scan,
  CreditCard,
  UserCheck
} from 'lucide-react'
import RegistrationForm from '@/components/RegistrationForm'
import ScrollAnimations from '@/components/ScrollAnimations'

export const metadata: Metadata = {
  title: 'Flotix - Intelligente Flottenkosten-Verwaltung',
  description: 'KI-gestützte Ausgabenverwaltung für moderne Fuhrparks. Automatisieren Sie die Belegbearbeitung, verfolgen Sie Ausgaben und gewinnen Sie Einblicke.',
  keywords: 'Flottenmanagement, Spesenabrechnung, OCR, KI, Fuhrpark, Ausgaben, Mobile App',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <ScrollAnimations />
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      {/* Navigation */}
      <nav className="relative bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 animate-slide-in-left cursor-pointer group">
              <div className="relative hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-pulse-enhanced">
                  <Truck className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse-enhanced"></div>
              </div>
              <div className="group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-gradient-shift">Flotix</span>
                <div className="text-xs text-blue-200 font-medium tracking-wider hover:text-white transition-colors duration-300">FLEET MANAGEMENT</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8 animate-slide-in-right">
              <a href="#features" className="text-white/80 hover:text-white transition-all duration-300 relative group hover:scale-110 hover-lift gpu-accelerated">
                Funktionen
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:w-full transition-all duration-300 animate-gradient-shift"></span>
                <span className="absolute -inset-2 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-all duration-300 relative group hover:scale-110 hover-lift gpu-accelerated">
                So funktioniert's
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:w-full transition-all duration-300 animate-gradient-shift"></span>
                <span className="absolute -inset-2 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </a>
              <a href="#register" className="text-white/80 hover:text-white transition-all duration-300 relative group hover:scale-110 hover-lift gpu-accelerated">
                Portal anfragen
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:w-full transition-all duration-300 animate-gradient-shift"></span>
                <span className="absolute -inset-2 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </a>
              <Link href="/login" className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-110 font-semibold overflow-hidden gpu-accelerated">
                <span className="relative z-10">Anmelden</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        {/* Stunning Animated Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.8) 2px, transparent 0)`,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse-enhanced"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-full filter blur-3xl animate-float-slow"></div>

        {/* Professional Floating Particles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-particle-float opacity-60" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-indigo-400 rounded-full animate-bounce-enhanced opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-60 right-10 w-5 h-5 bg-blue-300 rounded-full animate-float-slow opacity-30" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-enhanced opacity-50" style={{animationDelay: '1.5s'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center relative z-10">
            <div className="mb-8 animate-fade-in-down gpu-accelerated" style={{animationDelay: '0.2s'}}>
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium backdrop-blur-sm hover:scale-110 hover-glow transition-all duration-500 cursor-default shadow-glow-blue animate-pulse-enhanced">
                🚀 KI-gestützte Flottenmanagement-Lösung
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-fade-in-up gpu-accelerated" style={{animationDelay: '0.4s'}}>
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent animate-gradient-shift hover:scale-105 transition-transform duration-700 inline-block">
                Revolutionieren Sie
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent relative animate-gradient-shift hover:scale-105 transition-transform duration-700 inline-block">
                Ihr Flottenmanagement
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-30 animate-glow"></div>
                <div className="absolute -right-6 -top-6 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse-enhanced opacity-70 hover:scale-125 transition-transform duration-300 shadow-glow-blue"></div>
                <div className="absolute -left-8 -bottom-4 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-bounce-enhanced opacity-60" style={{animationDelay: '0.5s'}}></div>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/90 mb-16 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              Erleben Sie die Zukunft der <span className="text-white font-semibold gradient-text hover:scale-105 transition-transform duration-300 inline-block">KI-gestützten Ausgabenverwaltung</span>.
              Automatisieren Sie Belegverarbeitung, optimieren Sie Kosten und gewinnen Sie
              <span className="text-white font-semibold relative group cursor-default inline-block">
                tiefgreifende Einblicke
                <span className="absolute inset-x-0 -bottom-1 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full animate-gradient-shift"></span>
              </span> in Ihre Flottenperformance.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in-up" style={{animationDelay: '0.8s'}}>
              <Link href="/login" className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-3 hover:scale-110 inline-flex items-center justify-center overflow-hidden hover-lift gpu-accelerated">
                <span className="relative z-10">Kostenlos starten</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-3 group-hover:scale-125 transition-all duration-500 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              </Link>
              <button className="group relative border-2 border-white/30 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:border-white/60 hover:bg-white/10 transition-all duration-500 backdrop-blur-sm transform hover:-translate-y-2 hover:scale-105 overflow-hidden gpu-accelerated">
                <span className="relative z-10">Live Demo ansehen</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-blue-200/80 text-sm animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="flex items-center group hover:text-green-300 transition-all duration-300 hover:scale-110 cursor-default">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400 group-hover:scale-125 transition-transform duration-300 animate-pulse-enhanced" />
                Keine Kreditkarte erforderlich
              </div>
              <div className="flex items-center group hover:text-green-300 transition-all duration-300 hover:scale-110 cursor-default">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400 group-hover:scale-125 transition-transform duration-300 animate-pulse-enhanced" style={{animationDelay: '0.2s'}} />
                30 Tage kostenlos testen
              </div>
              <div className="flex items-center group hover:text-green-300 transition-all duration-300 hover:scale-110 cursor-default">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400 group-hover:scale-125 transition-transform duration-300 animate-pulse-enhanced" style={{animationDelay: '0.4s'}} />
                Sofortige Einrichtung
              </div>
            </div>
          </div>
        </div>

        {/* Orbital Moving Expense/Person Icons - Around Text Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          {/* Person Scanning Receipt - Large Clockwise Orbit */}
          <div className="absolute top-0 left-0 animate-orbit-clockwise">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center hover-lift hover-glow shadow-glow-green cursor-pointer gpu-accelerated animate-scan pointer-events-auto">
              <div className="relative">
                <User className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Scan className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Receipt with Money - Large Counter-Clockwise */}
          <div className="absolute top-0 left-0 animate-orbit-counter-clockwise">
            <div className="w-18 h-18 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center hover-lift hover-glow shadow-glow-blue cursor-pointer gpu-accelerated pointer-events-auto">
              <div className="relative">
                <Receipt className="w-8 h-8 text-white" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <DollarSign className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Person with Credit Card - Extra Large Orbit */}
          <div className="absolute top-0 left-0 animate-orbit-large">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center hover-lift hover-glow shadow-glow-purple cursor-pointer gpu-accelerated pointer-events-auto">
              <div className="relative">
                <UserCheck className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded flex items-center justify-center animate-pulse">
                  <CreditCard className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Person - Elliptical Orbit */}
          <div className="absolute top-0 left-0 animate-orbit-elliptical">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center hover-lift hover-glow shadow-glow-blue cursor-pointer gpu-accelerated pointer-events-auto">
              <div className="relative">
                <BarChart3 className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Mobile User - Reverse Large Orbit */}
          <div className="absolute top-0 left-0 animate-orbit-mobile">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400/30 to-red-500/30 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center hover-lift hover-glow cursor-pointer gpu-accelerated pointer-events-auto">
              <div className="relative">
                <Smartphone className="w-5 h-5 text-white" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="relative py-24 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 overflow-hidden scroll-trigger z-10">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[size:40px_40px] parallax-element" data-speed="0.3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 scroll-trigger">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-4 animate-gradient-shift">
              Bewährte Ergebnisse
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Über 1000+ Unternehmen vertrauen bereits auf unsere innovative Lösung
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 scroll-trigger hover-lift magnetic-button">
              <div className="mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 animate-gradient-shift">99,5%</div>
                <div className="text-gray-600 font-medium">OCR-Genauigkeit</div>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mx-auto group-hover:w-20 transition-all duration-300 animate-gradient-shift"></div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 scroll-trigger hover-lift magnetic-button" style={{animationDelay: '0.2s'}}>
              <div className="mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 animate-gradient-shift">75%</div>
                <div className="text-gray-600 font-medium">Zeitersparnis</div>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto group-hover:w-20 transition-all duration-300 animate-gradient-shift"></div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 scroll-trigger hover-lift magnetic-button" style={{animationDelay: '0.4s'}}>
              <div className="mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 animate-gradient-shift">1000+</div>
                <div className="text-gray-600 font-medium">Vertrauende Unternehmen</div>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto group-hover:w-20 transition-all duration-300 animate-gradient-shift"></div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 scroll-trigger hover-lift magnetic-button" style={{animationDelay: '0.6s'}}>
              <div className="mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 animate-gradient-shift">24/7</div>
                <div className="text-gray-600 font-medium">Experten-Support</div>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto group-hover:w-20 transition-all duration-300 animate-gradient-shift"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/circuit.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium backdrop-blur-sm">
                ⚡ Modernste Technologie
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                Leistungsstarke
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Funktionen
              </span>
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
              Alles was Sie für die effiziente Verwaltung von Flottenkosten benötigen –
              <span className="text-white font-semibold">in einer intelligenten Plattform</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ScanText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors duration-300">KI-gestützte OCR</h3>
                <p className="text-blue-100/80 leading-relaxed">Extrahieren Sie automatisch Daten aus Belegen mit fortschrittlicher KI-Technologie bei 99,5% Genauigkeit.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-100 transition-colors duration-300">Mobile App</h3>
                <p className="text-blue-100/80 leading-relaxed">Benutzerfreundliche mobile App für Fahrer zum Erfassen und Einreichen von Ausgaben unterwegs.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-400/30 to-emerald-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-100 transition-colors duration-300">Echtzeit-Analysen</h3>
                <p className="text-blue-100/80 leading-relaxed">Umfassende Dashboards mit Einblicken in Ausgabenmuster und Kostenoptimierung.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-purple-400/30 to-purple-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-100 transition-colors duration-300">Mehrstufiger Zugriff</h3>
                <p className="text-blue-100/80 leading-relaxed">Rollenbasierte Berechtigungen für Admins, Fahrer und Super-Admins mit firmenspezifischen Daten.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-red-400/30 to-red-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-100 transition-colors duration-300">Unternehmenssicherheit</h3>
                <p className="text-blue-100/80 leading-relaxed">Bankensicherheit mit JWT-Authentifizierung, Audit-Protokollierung und Datenverschlüsselung.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-yellow-400/30 to-orange-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-100 transition-colors duration-300">Intelligente Berichte</h3>
                <p className="text-blue-100/80 leading-relaxed">Automatisierte Berichterstattung mit Export-Funktionen und anpassbaren Filtern für Compliance.</p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-indigo-400/30 to-indigo-600/30 rounded-full">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_70%)]"></div>
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <FileText className="w-4 h-4 mr-2" />
              Einfacher Prozess
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                So funktioniert's
              </span>
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
              Einfacher 3-Schritte-Prozess zur Transformation Ihrer Ausgabenverwaltung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25">
                <div className="relative mx-auto mb-8 w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Beleg erfassen</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Fahrer fotografieren einfach ihren Beleg mit unserer mobilen App. Keine manuelle Dateneingabe erforderlich.
                </p>
              </div>
            </div>

            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/25">
                <div className="relative mx-auto mb-8 w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">KI-Verarbeitung</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Unsere KI extrahiert sofort Händler, Betrag, Datum und Kategorie aus dem Beleg mit 99,5% Genauigkeit.
                </p>
              </div>
            </div>

            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="relative mx-auto mb-8 w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Sofortige Einblicke</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Admins erhalten Echtzeit-Transparenz über Ausgaben mit Analysen, Berichten und automatisierter Compliance-Verfolgung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative bg-gradient-to-br from-black via-slate-900 to-blue-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.2),transparent_70%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Bewährte Ergebnisse
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Warum Flotix wählen?
              </span>
            </h2>
            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
              Transformieren Sie Ihr Flottenmanagement mit bewährten Ergebnissen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl backdrop-blur-sm border border-blue-400/30"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">75% Zeit sparen</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Eliminieren Sie manuelle Dateneingabe und Genehmigungsworkflows
                </p>
              </div>
            </div>

            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/25">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-400/30"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Kosten senken</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Bessere Transparenz führt zu 20% Reduktion der Ausgaben
                </p>
              </div>
            </div>

            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-purple-400/30"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Compliance verbessern</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Automatisierte Audit-Pfade und Richtliniendurchsetzung
                </p>
              </div>
            </div>

            <div className="group relative text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/25">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl backdrop-blur-sm border border-yellow-400/30"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Mühelos skalieren</h3>
                <p className="text-blue-100/80 leading-relaxed">
                  Multi-Tenant-Architektur wächst mit Ihrem Unternehmen
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 relative bg-gradient-to-b from-slate-900/50 to-black/50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Truck className="w-4 h-4 mr-2" />
              Bereit für den Erfolg
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Portal-Zugang anfordern
              </span>
            </h2>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Geben Sie Ihre E-Mail ein, um Zugang zu unserem Flottenmanagement-Portal zu erhalten
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
            <div className="relative">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative bg-gradient-to-br from-black via-slate-900 to-black">
        {/* Background Effects */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Kundenerfahrungen
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Was unsere Kunden sagen
              </span>
            </h2>
            <p className="text-xl text-blue-100/80">Vertraut von Flottenmanagern weltweit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100/90 mb-6 leading-relaxed">"Flotix reduzierte unsere Ausgabenbearbeitungszeit um 80%. Die OCR-Genauigkeit ist unglaublich und unsere Fahrer lieben die einfache Bedienung."</p>
                <div>
                  <div className="font-semibold text-white">Sarah Johnson</div>
                  <div className="text-blue-200/70">Flottenmanager, LogiCorp</div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100/90 mb-6 leading-relaxed">"Das Analyse-Dashboard gibt uns Einblicke, die wir nie zuvor hatten. Wir haben erhebliche Kosteneinsparungsmöglichkeiten identifiziert."</p>
                <div>
                  <div className="font-semibold text-white">Mike Chen</div>
                  <div className="text-blue-200/70">Betriebsleiter, Swift Transport</div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100/90 mb-6 leading-relaxed">"Die Implementierung war reibungslos und das Support-Team ist fantastisch. ROI wurde im ersten Quartal erreicht."</p>
                <div>
                  <div className="font-semibold text-white">Emily Rodriguez</div>
                  <div className="text-blue-200/70">Finanzvorstand, Metro Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-sm">
            <Truck className="w-4 h-4 mr-2" />
            Jetzt starten
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Bereit, Ihr Flottenmanagement
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
              zu transformieren?
            </span>
          </h2>

          <p className="text-xl text-blue-100/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Schließen Sie sich Hunderten von Unternehmen an, die bereits Zeit und Geld mit Flotix sparen
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login" className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1">
              <span className="relative z-10">Kostenlos testen</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <button className="group relative border-2 border-white/50 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              <span className="relative z-10">Demo planen</span>
              <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100/70 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              14 Tage kostenlos testen
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Keine Einrichtungsgebühren
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Jederzeit kündbar
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/90 text-white py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-black to-slate-900/50"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Flotix</span>
              </div>
              <p className="text-blue-100/80 leading-relaxed">Die moderne Lösung für Flottenkosten-Management. KI-gestützt, für Skalierung entwickelt.</p>

              <div className="mt-6 space-y-2">
                <div className="flex items-center text-blue-100/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Vertraut von 500+ Unternehmen
                </div>
                <div className="flex items-center text-blue-100/60 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  99.9% Uptime-Garantie
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Produkt</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Funktionen</a></li>
                <li><a href="#pricing" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Preise</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">API-Dokumentation</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Mobile App</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Integrationen</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Unternehmen</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Über uns</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Karriere</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Presse</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Kontakt</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Partner</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Hilfe-Center</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Dokumentation</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">System Status</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Sicherheit</a></li>
                <li><a href="#" className="text-blue-100/70 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-blue-100/60 text-sm">© 2024 Flotix. Alle Rechte vorbehalten.</p>
              <div className="flex space-x-8 mt-6 md:mt-0">
                <Link href="/datenschutz" className="text-blue-100/60 hover:text-white transition-colors text-sm hover:underline">Datenschutz</Link>
                <Link href="/impressum" className="text-blue-100/60 hover:text-white transition-colors text-sm hover:underline">Impressum</Link>
                <a href="#" className="text-blue-100/60 hover:text-white transition-colors text-sm hover:underline">Cookie-Richtlinie</a>
                <a href="#" className="text-blue-100/60 hover:text-white transition-colors text-sm hover:underline">AGB</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}