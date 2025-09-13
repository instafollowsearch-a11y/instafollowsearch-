import React from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const HowItWorks = () => {
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  const StepCard = ({ step, index }) => {
    const [cardRef, isCardVisible] = useScrollAnimation();
    
    return (
      <div
        ref={cardRef}
        className={`relative group transition-all duration-700 ${
          isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 200}ms` }}
      >
        {/* Step number */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10">
          {step.step}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 relative">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
            {step.icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
            {step.title}
          </h3>
          <p className="text-white/70 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    );
  };
  const steps = [
    {
      step: '01',
      title: 'Enter Username',
      description: 'Simply enter the Instagram username of the account you want to check',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      step: '02',
      title: 'Instant Analysis',
      description: 'Our algorithm instantly finds and analyzes recent followers and following',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      step: '03',
      title: 'Get Results',
      description: 'View sorted list of new followers and following from newest to oldest',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            How Does It
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Work?
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Three simple steps to discover the truth about any Instagram account. 
            No complex setup or registration required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/40 to-purple-500/20 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* Demo video placeholder */}
        {/*<div className="mt-20 text-center">*/}
        {/*  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-4xl mx-auto">*/}
        {/*    <h3 className="text-2xl font-semibold text-white mb-6">See How It Works</h3>*/}
        {/*    */}
        {/*    /!* Video placeholder *!/*/}
        {/*    <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl overflow-hidden group cursor-pointer">*/}
        {/*      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>*/}
        {/*      */}
        {/*      /!* Play button *!/*/}
        {/*      <div className="absolute inset-0 flex items-center justify-center">*/}
        {/*        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">*/}
        {/*          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*            <path d="M8 5v14l11-7z"/>*/}
        {/*          </svg>*/}
        {/*        </div>*/}
        {/*      </div>*/}

        {/*      /!* Decorative elements *!/*/}
        {/*      <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full"></div>*/}
        {/*      <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-500 rounded-full"></div>*/}
        {/*      <div className="absolute top-4 left-16 w-3 h-3 bg-green-500 rounded-full"></div>*/}
        {/*    </div>*/}

        {/*    <p className="text-white/70 mt-6">*/}
        {/*      Watch a step-by-step guide on how to use our service*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </section>
  )
}

export default HowItWorks