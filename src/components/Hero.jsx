import React from 'react'
import SearchForm from './SearchForm.jsx'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const Hero = () => {
  const [heroRef, isHeroVisible] = useScrollAnimation();
  const [badgeRef, isBadgeVisible] = useScrollAnimation();
  const [headingRef, isHeadingVisible] = useScrollAnimation();
  const [subtitleRef, isSubtitleVisible] = useScrollAnimation();
  const [formRef, isFormVisible] = useScrollAnimation();
  const [badgesRef, isBadgesVisible] = useScrollAnimation();

  return (
    <section id="hero" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div ref={heroRef} className={`relative max-w-7xl mx-auto transition-all duration-700 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center">
          {/* Badge */}
          <div ref={badgeRef} className={`inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 transition-all duration-700 ${isBadgeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
400,000+ Accounts Searched
          </div>

          {/* Main heading */}
          <h1 ref={headingRef} className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-700 ${isHeadingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block">Track Instagram</span>
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Activity Instantly
            </span>
          </h1>

          {/* Subtitle */}
          <p ref={subtitleRef} className={`text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ${isSubtitleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            Check anyone's recent follows anonymously
          </p>

          {/* Search form */}
          <div ref={formRef} className={`mb-12 transition-all duration-700 ${isFormVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <SearchForm />
          </div>

          {/* Features badges */}
          <div ref={badgesRef} className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-700 ${isBadgesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/90 text-sm">100% Anonymous</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-white/90 text-sm">Secure</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-white/90 text-sm">Instant Results</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">400K+</div>
              <div className="text-white/70">Accounts Searched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">8K+</div>
              <div className="text-white/70">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/70">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero