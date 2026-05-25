import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: "Is university really free in Germany?",
    answer: "Yes! Public universities in Germany charge €0 for tuition, even for international students. You only pay a small semester contribution (usually €150-€300) which often includes a public transport ticket for the region."
  },
  {
    question: "What is a Blocked Account (Sperrkonto)?",
    answer: "A Blocked Account is a requirement by the German government to prove you have enough financial resources to live in Germany for a year. Currently, you need to deposit €11,904, from which you can withdraw a maximum of €992 per month for your living expenses."
  },
  {
    question: "Do I need to speak German to study there?",
    answer: "Not necessarily. Germany offers hundreds of English-taught programs, especially at the Master's level. However, learning basic German is highly recommended for daily life, integration, and finding part-time jobs."
  },
  {
    question: "Can I work while studying?",
    answer: "Absolutely! International students are legally allowed to work up to 140 full days or 280 half days per year. This is usually enough to cover your monthly living expenses without dipping into your blocked account."
  },
  {
    question: "What happens after I graduate?",
    answer: "Germany offers an 18-month post-study job seeker visa. This gives you a year and a half to find a job related to your field of study. Once you find a job, you can easily transition to a work residence permit or an EU Blue Card."
  },
  {
    question: "How does Move2Deutschland help me?",
    answer: "We provide end-to-end support: from profile evaluation and university selection, to application processing, Blocked Account setup, and visa interview preparation. We engineer your success story so you don't have to navigate the complex process alone."
  },
  {
    question: "What are the requirements for a Master's program?",
    answer: "Generally, you need a recognized Bachelor's degree with a good CGPA (usually 2.5 or better on the German scale), English proficiency (IELTS/TOEFL or medium of instruction letter), a motivation letter, and sometimes specific academic credits related to the Master's program."
  },
  {
    question: "How long does the entire process take?",
    answer: "The process typically takes 6 to 9 months from university application to visa approval. We recommend starting your application at least 8 months before your intended intake (Winter semester starts in October, Summer semester starts in April)."
  },
  {
    question: "Can I bring my family with me?",
    answer: "Yes, family reunification is possible, but it requires you to prove sufficient financial resources and living space for your dependents. It's often easier to bring them after you have graduated and secured a full-time job."
  },
  {
    question: "What is the cost of living in Germany?",
    answer: "On average, students need about €850 to €1,200 per month to cover rent, food, health insurance, and personal expenses. Costs vary depending on the city, with places like Munich or Frankfurt being more expensive than smaller university towns."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about studying in Germany and how Move2Deutschland can help you get there.
          </p>
        </div>

        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-colors ${
                openIndex === index ? 'border-prussian-blue bg-blue-50/30' : 'border-slate-200 bg-white hover:border-prussian-blue/30'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-prussian-blue pr-4 text-base md:text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    openIndex === index ? 'bg-prussian-blue text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Call to Action Card */}
        <div className="bg-prussian-blue rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">Still have questions?</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Our experts are ready to evaluate your profile and guide you through the entire process. Find out if you're eligible in just 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => document.getElementById('questionnaire')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-gold text-prussian-blue font-bold py-4 px-8 rounded-full hover:bg-yellow-400 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)]"
              >
                Check My Eligibility
              </button>
              <a 
                href="#"
                className="w-full sm:w-auto bg-white/10 border border-white/20 text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
