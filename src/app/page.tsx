import Link from 'next/link'
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
  DollarSign
} from 'lucide-react'



export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Flotix</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8">
              Streamline Your
              <span className="block text-blue-600">Fleet Expenses</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              AI-powered expense management for modern fleets. Automate receipt processing, 
              track spending, and gain insights with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.5%</div>
              <div className="text-gray-600">OCR Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">75%</div>
              <div className="text-gray-600">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Companies Trust Us</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage fleet expenses efficiently</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <ScanText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered OCR</h3>
              <p className="text-gray-600">Automatically extract data from receipts using advanced AI technology with 99.5% accuracy.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile App</h3>
              <p className="text-gray-600">Easy-to-use mobile app for drivers to capture and submit expenses on the go.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-600">Comprehensive dashboards with insights into spending patterns and cost optimization.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Role Access</h3>
              <p className="text-gray-600">Role-based permissions for admins, drivers, and super admins with company-scoped data.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">Bank-grade security with JWT authentication, audit logging, and data encryption.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Reports</h3>
              <p className="text-gray-600">Automated reporting with export capabilities and customizable filters for compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple 3-step process to transform your expense management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Capture Receipt</h3>
              <p className="text-gray-600">Drivers simply take a photo of their receipt using our mobile app. No manual data entry required.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Processing</h3>
              <p className="text-gray-600">Our AI instantly extracts merchant, amount, date, and category from the receipt with 99.5% accuracy.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Insights</h3>
              <p className="text-gray-600">Admins get real-time visibility into expenses with analytics, reports, and automated compliance tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Flotix?</h2>
            <p className="text-xl text-blue-100">Transform your fleet management with proven results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Save 75% Time</h3>
              <p className="text-blue-100">Eliminate manual data entry and approval workflows</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Reduce Costs</h3>
              <p className="text-blue-100">Better visibility leads to 20% reduction in expenses</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Improve Compliance</h3>
              <p className="text-blue-100">Automated audit trails and policy enforcement</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Scale Effortlessly</h3>
              <p className="text-blue-100">Multi-tenant architecture grows with your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your fleet size</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$29<span className="text-lg font-normal text-gray-600">/month</span></div>
              <p className="text-gray-600 mb-6">Perfect for small fleets</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Up to 10 drivers</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />OCR processing</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Mobile app access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Basic analytics</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Email support</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors">Start Free Trial</button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$79<span className="text-lg font-normal text-gray-600">/month</span></div>
              <p className="text-gray-600 mb-6">Ideal for growing fleets</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Up to 50 drivers</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Advanced OCR + AI insights</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Full mobile features</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Advanced analytics</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Priority support</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Custom integrations</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Start Free Trial</button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Unlimited drivers</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />White-label options</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />API access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Custom workflows</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Dedicated support</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />SLA guarantee</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Trusted by fleet managers worldwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"Flotix reduced our expense processing time by 80%. The OCR accuracy is incredible and our drivers love how easy it is to use."</p>
              <div>
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-600">Fleet Manager, LogiCorp</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"The analytics dashboard gives us insights we never had before. We've identified significant cost savings opportunities."</p>
              <div>
                <div className="font-semibold text-gray-900">Mike Chen</div>
                <div className="text-gray-600">Operations Director, Swift Transport</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"Implementation was smooth and the support team is fantastic. ROI was achieved within the first quarter."</p>
              <div>
                <div className="font-semibold text-gray-900">Emily Rodriguez</div>
                <div className="text-gray-600">CFO, Metro Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Fleet Management?</h2>
          <p className="text-xl text-blue-100 mb-8">Join hundreds of companies already saving time and money with Flotix</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
          <p className="text-blue-100 mt-4">14-day free trial • No setup fees • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Flotix</span>
              </div>
              <p className="text-gray-300">The modern solution for fleet expense management. Powered by AI, built for scale.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">© 2024 Flotix. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}