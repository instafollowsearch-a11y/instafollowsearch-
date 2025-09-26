import React from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.js'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'
import { useSubscription } from '../contexts/SubscriptionContext'

const Features = () => {
  const navigate = useNavigate();
  const [headerRef, isHeaderVisible] = useScrollAnimation();
  const { getPlanTier } = useSubscription();
  
  const FeatureCard = ({ feature, index }) => {
    const [cardRef, isCardVisible] = useScrollAnimation();
    
    const handleClick = () => {
      if (!apiService.isAuthenticated()) {
        document.dispatchEvent(new CustomEvent('showAuthModal'));
        return;
      }

      // Handle different feature behaviors
      if (feature.type === 'scroll-to-search') {
        // Track Recent Followers & Red Flag Detection
        const searchSection = document.getElementById('search-section');
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (feature.type === 'conditional-navigation') {
        // Track Recent Followers & Red Flag Detection - Premium users go to Advanced Search
        const planTier = getPlanTier();
        if (planTier >= 2) {
          window.location.href = '/dashboard/search';
        } else {
          const searchSection = document.getElementById('search-section');
          if (searchSection) {
            searchSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else if (feature.type === 'view-profile') {
        // View Instagram Profile - Free/Basic users can access, but will see upgrade prompt on the page
        navigate('/viewprofile');
      } else if (feature.link) {
        // Direct navigation for other features
        window.location.href = feature.link;
      }
    };
    
    return (
      <div
        ref={cardRef}
        onClick={handleClick}
        className={`group relative p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-700 hover:transform hover:scale-105 cursor-pointer ${
          isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 text-white`}>
            {feature.icon}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-4">
            {feature.title}
          </h3>
          
          {/* Description */}
          <p className="text-white/70 leading-relaxed mb-4">
            {feature.description}
          </p>
          
          {/* Click indicator */}
          <div className="flex items-center text-white/50 text-sm group-hover:text-white/80 transition-colors">
            <span>
              {feature.type === 'conditional-navigation' 
                ? 'Click to access (Basic: Homepage, Premium: Advanced Search)'
                : 'Click to access'
              }
            </span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
        </svg>
      ),
      title: 'Advanced Search',
      description: 'Comprehensive Instagram analysis with detailed comparison tools and real-time data processing',
      gradient: 'from-blue-500 to-cyan-500',
      link: '/dashboard/search'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Shared Activity',
      description: 'Discover mutual connections and shared interactions between any two Instagram accounts',
      gradient: 'from-purple-500 to-pink-500',
      link: '/sharedactivity'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'View & Download Stories',
      description: 'Watch Instagram stories anonymously and download them for offline viewing',
      gradient: 'from-green-500 to-teal-500',
      link: '/dashboard/search'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Admirer Feature',
      description: 'Discover who interacts with your page or a page you\'re interested in the most.',
      gradient: 'from-red-500 to-pink-500',
      link: '/dashboard'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6a4 4 0 100 8 4 4 0 000-8zm8 8a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
      ),
      title: 'View Instagram Profile',
      description: 'Open a public Instagram profile by entering a username',
      gradient: 'from-indigo-500 to-purple-600',
      type: 'view-profile'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: 'Track Recent Followers',
      description: 'Monitor who recently followed any Instagram account with detailed follower analytics',
      gradient: 'from-yellow-500 to-orange-500',
      type: 'conditional-navigation'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Red Flag Detection',
      description: 'Automatically reveal new interactions from users most likely interested in the profile you\'re searching—no guesswork',
      gradient: 'from-indigo-500 to-purple-500',
      type: 'conditional-navigation'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Download Instagram Posts',
      description: 'Download any Instagram post, story, or media content for offline viewing and archiving',
      gradient: 'from-emerald-500 to-teal-500',
      link: '/dashboard/search'
    }
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagram Tracking
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            All the tools you need to analyze Instagram activity. 
            Simple to use, powerful in capabilities.
          </p>
        </div>

        {/* Features grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <div key={index} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] flex justify-center">
              <FeatureCard feature={feature} index={index} />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button 
            onClick={() => {
              if (apiService.isAuthenticated()) {
                window.location.href = '/dashboard';
              } else {
                document.dispatchEvent(new CustomEvent('showAuthModal'));
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Start Checking Now
          </button>
        </div>
      </div>
    </section>
  )
}

export default Features