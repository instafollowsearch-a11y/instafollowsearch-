import React, { useState } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null)
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  const FAQItem = ({ faq, index }) => {
    const [itemRef, isItemVisible] = useScrollAnimation();
    
    return (
      <div
        ref={itemRef}
        className={`bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden transition-all duration-700 ${
          isItemVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        <button
          onClick={() => toggleItem(index)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white pr-4">
            {faq.question}
          </h3>
          <svg 
            className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
              openItem === index ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openItem === index && (
          <div className="px-6 pb-4">
            <p className="text-white/70 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        )}
      </div>
    );
  };

  const faqs = [
    {
      question: "Do I need to connect my Instagram?",
      answer: "No, you don't need to connect your Instagram. All you need is the @username of a public page."
    },
    {
      question: "Will the user know I'm searching for them?",
      answer: "Absolutely not. Your searches are completely private."
    },
    {
      question: "How does it work?",
      answer: "Simply enter a public username into our search, and our technology organizes the followers for you—removing the guesswork."
    },
    {
      question: "Is Followersearch reliable?",
      answer: "Yes. Followersearch is trusted by our users, which is why they continue to return."
    },
    {
      question: "If I forget to cancel my subscription, can I get a refund?",
      answer: "We understand that sometimes you may need a refund. While our standard policy is non-refundable, we do consider refund requests on a case-by-case basis. Please contact our support team with your request and we'll review it within 24 hours."
    },
    {
      question: "Does it work with private accounts?",
      answer: "No, we can only analyze public Instagram accounts in accordance with Instagram's policies."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription anytime. No hidden fees or commitments."
    },
    {
      question: "Is there a mobile app?",
      answer: "Not yet, but our website is fully responsive and works perfectly in mobile browsers."
    }
  ]

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to know about Followersearch. 
            Can't find the answer you're looking for? Contact us.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-white/60 mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@instarecentfollow.com"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact Support
            </a>

          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ 