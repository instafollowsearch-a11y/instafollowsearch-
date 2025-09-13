import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import AuthModal from './AuthModal.jsx'
import apiService from '../services/api.js'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout: logoutSubscription } = useSubscription()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [authCheckCounter, setAuthCheckCounter] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    const handleShowAuthModal = () => {
      setIsAuthModalOpen(true)
    }

    // Check authentication state on mount
    const checkAuth = () => {
      const authState = apiService.isAuthenticated()
      console.log('Header - Authentication state:', authState)
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('showAuthModal', handleShowAuthModal)
    
    // Check auth on mount
    checkAuth()
    
    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth()
      setAuthCheckCounter(prev => prev + 1)
    }
    
    // Listen for storage changes (when token is added/removed)
    window.addEventListener('storage', handleAuthChange)
    
    // Listen for custom auth change events
    document.addEventListener('authStateChanged', handleAuthChange)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('showAuthModal', handleShowAuthModal)
      window.removeEventListener('storage', handleAuthChange)
      document.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  // Force re-render when component mounts to check auth state
  useEffect(() => {
    setAuthCheckCounter(prev => prev + 1)
  }, [])

  const handleAuthSuccess = () => {
    // Authentication state will be checked directly from apiService
    setAuthCheckCounter(prev => prev + 1)
    // Dispatch auth state change event to trigger subscription refetch
    document.dispatchEvent(new CustomEvent('authStateChanged'))
  }

  const handleLogout = () => {
    apiService.removeToken()
    logoutSubscription() // Clear subscription state
    // Force re-render by dispatching custom event
    document.dispatchEvent(new CustomEvent('authStateChanged'))
    setAuthCheckCounter(prev => prev + 1)
    // Navigate to homepage
    navigate('/')
    // Force page reload to clear all state
    window.location.reload()
  }

  const scrollToSection = (sectionId) => {
    // Check if we're on the homepage
    if (location.pathname === '/') {
      // On homepage, just scroll to the section
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Not on homepage, navigate to homepage and then scroll
      navigate('/')
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const scrollToTop = () => {
    // Check if we're on the homepage
    if (location.pathname === '/') {
      // On homepage, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Not on homepage, navigate to homepage
      navigate('/')
    }
  }

  return (
    <>
      <header className="relative z-40 bg-white/10 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={scrollToTop}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">FollowerSearch</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            {apiService.isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Logout
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  Dashboard
                </button>
                {/* User Avatar */}
                <button
                  onClick={() => navigate('/profile')}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
                  title="View Profile"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
              >
                Log In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/70 hover:text-white inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md rounded-lg mt-2">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-white/70 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-white/70 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-white/70 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-white/70 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              FAQ
            </button>
            {apiService.isAuthenticated() ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full text-left text-white block px-3 py-2 rounded-md text-base font-medium flex items-center mt-2"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  View Profile
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>

    {/* Scroll to top button */}
    {showScrollTop && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-110"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    )}

    <AuthModal 
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onSuccess={handleAuthSuccess}
    />
  </>
  )
}

export default Header