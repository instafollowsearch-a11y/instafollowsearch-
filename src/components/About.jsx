import React from 'react'

const About = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            About
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Followersearch
            </span>
          </h2>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 md:p-12">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              Our platform gives users, fans, and loved ones the ability to view recent activity on the pages they care about. 
              Followersearch was created with transparency in mind—because you deserve to stay informed.
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
                  <p className="text-white/80">
                    We want to be clear: we do not condone stalking, harassment, or any misuse of our platform in any way. 
                    Our service is designed for legitimate use cases only.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Our Mission</h3>
                <p className="text-white/70 leading-relaxed">
                  To provide transparent, reliable Instagram analytics that help users understand social media activity 
                  in a responsible and ethical manner.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Our Values</h3>
                <ul className="text-white/70 space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Privacy & Security
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Transparency
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ethical Use
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    User Trust
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About 