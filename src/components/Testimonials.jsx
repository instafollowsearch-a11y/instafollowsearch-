import React from 'react'
import apiService from '../services/api.js'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const Testimonials = () => {
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  const TestimonialCard = ({ testimonial, index }) => {
    const [cardRef, isCardVisible] = useScrollAnimation();
    
    return (
      <div
        ref={cardRef}
        className={`bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-700 hover:transform hover:scale-105 ${
          isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Testimonial text */}
        <p className="text-white/80 leading-relaxed mb-6 italic">
          "{testimonial.text}"
        </p>

        {/* Author info */}
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-2xl mr-4">
            {testimonial.avatar}
          </div>
          <div>
            <div className="flex items-center">
              <h4 className="text-white font-semibold">{testimonial.name}</h4>
              {testimonial.verified && (
                <svg className="w-4 h-4 text-blue-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-white/60 text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    );
  };
  const testimonials = [
    {
      name: 'Samantha',
      role: 'User',
      avatar: '👩',
      text: 'My boyfriend moved to a different city, and I started feeling suspicious. I used InstaFollowSearch to check his activity and was disappointed to see he followed three new girls after insisting he hadn\'t talked to anyone all night.',
      rating: 5,
      verified: false
    },
    {
      name: 'Del',
      role: 'Business Owner',
      text: 'I wanted to see who was regularly visiting and supporting my business page. The Admirer feature made it super easy to track that.',
      avatar: '👨‍💼',
      rating: 5,
      verified: true
    },
    {
      name: 'Anonymous',
      role: 'User',
      text: 'My ex blocked me, and I couldn\'t view his page no matter how many new accounts I made. InstafollowSearch let me see his profile anyway.',
      avatar: '👤',
      rating: 5,
      verified: false
    },
    {
      name: 'Dexter',
      role: 'User',
      text: 'I used the Mutual Interactions feature to find out if my ex was lying about talking to other girls on Instagram—and it turned out I wasn\'t imagining things.',
      avatar: '👨',
      rating: 5,
      verified: false
    },
    {
      name: 'Jessica',
      role: 'User',
      text: 'I can finally relax knowing my boyfriend isn\'t secretly following OnlyFans models.',
      avatar: '👩',
      rating: 5,
      verified: false
    },
    {
      name: 'Kate',
      role: 'User',
      text: 'I was about to date this guy, but when I saw the kind of pages he followed, I realized we had totally different political views. Saved myself a big headache.',
      avatar: '👩',
      rating: 5,
      verified: false
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            8,000+ Happy Users
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            What Our Users
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Are Saying
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Thousands of people are already using our service to get truthful information 
            about Instagram activity. Here's what they say.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>



        {/* CTA */}
        <div className="text-center mt-12">
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
            Join Thousands of Users
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials