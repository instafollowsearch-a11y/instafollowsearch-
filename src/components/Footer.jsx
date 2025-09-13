import React from 'react'

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const footerLinks = {
    product: [
      { name: 'Features', action: () => scrollToSection('features') },
      { name: 'Pricing', action: () => scrollToSection('pricing') },
      { name: 'How It Works', action: () => scrollToSection('how-it-works') }
    ],
    company: [
      { name: 'About', action: () => scrollToSection('about') },
      { name: 'FAQ', action: () => scrollToSection('faq') }
    ],
    support: [
      { name: 'Help Center', href: 'mailto:support@instarecentfollow.com' }
    ]
  }

  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">FollowerSearch</span>
              </div>
              
              <p className="text-white/70 mb-6 max-w-sm">
                The most reliable and secure way to track Instagram activity. 
                Discover the truth anonymously and instantly.
              </p>

              <div className="flex items-center space-x-4">
                <a
                  href="mailto:support@instarecentfollow.com"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 hover:transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-white font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    {link.action ? (
                      <button
                        onClick={link.action}
                        className="text-white/70 hover:text-white transition-colors duration-200 text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    {link.action ? (
                      <button
                        onClick={link.action}
                        className="text-white/70 hover:text-white transition-colors duration-200 text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h3 className="text-white font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    {link.action ? (
                      <button
                        onClick={link.action}
                        className="text-white/70 hover:text-white transition-colors duration-200 text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-white/60 text-sm">
                © 2025 FollowerSearch. All rights reserved.
              </p>
              
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <span>Security provided by</span>
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Stripe</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>99.9% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer