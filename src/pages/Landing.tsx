import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Compass, 
  HeartHandshake, 
  Star, 
  Globe,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LeadQuestionnaire from '../components/LeadQuestionnaire';
import FAQ from '../components/FAQ';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialProof from '../components/SocialProof';
import PartnerMarquee from '../components/PartnerMarquee';
import TestimonialCarousel from '../components/TestimonialCarousel';

export default function Landing() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem('move2deutschland_lead_form');
    if (draft) {
      setHasDraft(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Abstract Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-prussian-blue/10 blur-[100px] pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px] pointer-events-none"
      ></motion.div>

      {/* Navigation */}
      <Navbar />

      {/* Resume Application Banner */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-[95%] max-w-7xl mx-auto mt-28 mb-[-5rem] relative z-40 bg-gold/10 backdrop-blur-md border border-gold/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-gold gap-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-bold text-sm shrink-0">💡</div>
              <p className="text-sm font-medium text-slate-100">
                Welcome back! You have an unfinished eligibility check.
              </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button 
                onClick={() => {
                  document.getElementById('questionnaire')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gold text-prussian-blue font-bold px-5 py-2 rounded-xl text-xs hover:bg-yellow-400 transition-colors shadow-md shrink-0 cursor-pointer"
              >
                Continue →
              </button>
              <button 
                onClick={() => setHasDraft(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss banner"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section 
        className="relative text-white pt-20 pb-24 sm:pb-40 px-6 md:px-12 overflow-hidden"
      >
        {/* Animated Background Image with Ken Burns loop */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            x: [0, 3, -3, 0],
            y: [0, -3, 3, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("/germany_hero_bg.png")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-prussian-blue/60 mix-blend-multiply z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-prussian-blue/70 via-prussian-blue/40 to-prussian-blue/80 z-2"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 mt-12"
          >
            Your Global Leap Starts in Germany. <br className="hidden md:block" />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-gold"
            >
              0 Tuition. 100% Opportunity.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            <strong>Stop dreaming</strong>, start planning your career. Move to Europe's economic powerhouse via tuition-free study or point based opportunity card for skilled workers routes.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,204,0,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('questionnaire')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all duration-300 w-full sm:w-auto cursor-pointer"
            >
              <span className="sm:hidden">Check Eligibility</span>
              <span className="hidden sm:inline">Check My Eligibility – 2 Minute Quiz</span>
            </motion.button>
            <Link to="/opportunity-card" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 w-full cursor-pointer"
              >
                Opportunity Card
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <div className="relative z-20 -mt-16 mb-12">
        <SocialProof />
      </div>

      {/* Partner Universities Marquee */}
      <div className="relative z-10 mb-16">
        <PartnerMarquee />
      </div>

      {/* Integration Point: Lead Qualification Questionnaire */}
      <section id="questionnaire" className="relative -mt-32 z-20 px-6 md:px-12 max-w-3xl mx-auto">
        <LeadQuestionnaire />
      </section>

      {/* The Logic Section */}
      <section id="why-germany" className="py-24 px-6 md:px-12 max-w-7xl mx-auto mt-12">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
            Why Germany is the Smart Choice
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            The most secure, logical path to international success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(0, 49, 83, 0.05)" }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 group transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <GraduationCap size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">Zero-Tuition</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Public universities in Germany charge €0 tuition. Invest your money in your life, not just a degree.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(0, 49, 83, 0.05)" }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 group transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Briefcase size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">18-Month Post-Study</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Germany gives you 1.5 years to find a professional role after graduation, ensuring a smooth career start.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(0, 49, 83, 0.05)" }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 group transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <TrendingUp size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">700,000+ Vacancies</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Germany is looking for its next generation of engineers, IT experts, and healthcare leaders to fill talent gaps.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(0, 49, 83, 0.05)" }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 group transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Globe size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">Citizenship Path</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Germany offers a pathway to citizenship in 5 years—what an opportunity to contribute and hold a top-tier passport.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Comparison Component */}
      <section className="py-24 px-6 md:px-12 bg-prussian-blue text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              The Reality Check
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              How Germany compares to traditional study destinations.
            </p>
          </div>

          {/* Table for Desktop and Tablet */}
          <div className="hidden sm:block bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-800">
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="p-4 md:p-6 bg-slate-50 font-heading font-bold text-sm md:text-lg flex items-center justify-center text-center">Feature</div>
              <div className="p-4 md:p-6 bg-slate-100 font-heading font-bold text-sm md:text-lg text-center border-l border-slate-200">UK / USA<br/><span className="text-xs md:text-sm text-red-500 font-normal">High Risk</span></div>
              <div className="p-4 md:p-6 bg-gold/10 font-heading font-bold text-sm md:text-lg text-center border-l border-slate-200 text-prussian-blue">Germany<br/><span className="text-xs md:text-sm text-green-600 font-normal">High Stability</span></div>
            </div>
            
            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Tuition Fees</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-red-650 font-semibold text-sm md:text-base">£15k - $40k / year</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-green-600 font-bold text-lg md:text-xl">€0</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Post-Study Visa</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-slate-600 text-sm md:text-base">Strict / Expensive</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-prussian-blue font-semibold text-sm md:text-base">18 Months Guaranteed</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Job Market</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-slate-650 text-sm md:text-base">Saturated</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-prussian-blue font-semibold text-sm md:text-base">700k+ Openings</div>
            </div>

            <div className="grid grid-cols-3 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Path to PR</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-red-600 font-medium text-sm md:text-base">Complex & Uncertain</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-green-600 font-bold text-sm md:text-base">Clear & Structured</div>
            </div>
          </div>

          {/* Cards for Mobile Devices (< 640px) */}
          <div className="sm:hidden space-y-6 text-slate-800">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-heading font-bold text-lg text-prussian-blue mb-4 border-b border-slate-100 pb-2">Tuition Fees</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">UK / USA (Risk)</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">£15k-40k / yr</p>
                </div>
                <div className="bg-gold/10 p-3 rounded-xl text-center border border-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Germany (Stable)</p>
                  <p className="text-lg font-extrabold text-green-600 mt-1">€0</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-heading font-bold text-lg text-prussian-blue mb-4 border-b border-slate-100 pb-2">Post-Study Visa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">UK / USA (Risk)</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Strict/Costly</p>
                </div>
                <div className="bg-gold/10 p-3 rounded-xl text-center border border-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Germany (Stable)</p>
                  <p className="text-xs font-bold text-prussian-blue mt-1">18 Mths Guar.</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-heading font-bold text-lg text-prussian-blue mb-4 border-b border-slate-100 pb-2">Job Market</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">UK / USA (Risk)</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Saturated</p>
                </div>
                <div className="bg-gold/10 p-3 rounded-xl text-center border border-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Germany (Stable)</p>
                  <p className="text-xs font-bold text-prussian-blue mt-1">700k+ Openings</p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-heading font-bold text-lg text-prussian-blue mb-4 border-b border-slate-100 pb-2">Path to PR</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">UK / USA (Risk)</p>
                  <p className="text-xs font-semibold text-red-650 mt-1">Uncertain</p>
                </div>
                <div className="bg-gold/10 p-3 rounded-xl text-center border border-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Germany (Stable)</p>
                  <p className="text-xs font-bold text-green-600 mt-1">Clear & Fast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-24 bg-gradient-to-b from-prussian-blue to-slate-50"></div>

      {/* Why Move2Deutschland Section */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
              Why Move<span className="text-gold">2</span>Deutschland?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              We don't just process applications; we engineer your success story in Germany.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(255, 204, 0, 0.2)" }}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-50 text-prussian-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Compass size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Expert Guidance</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Navigate the complex German university system and visa process with consultants who have successfully done it themselves.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(255, 204, 0, 0.2)" }}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-yellow-50 text-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <HeartHandshake size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Personalized Support</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                From university selection to finding accommodation and opening your blocked account, we are with you at every step.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(255, 204, 0, 0.2)" }}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-50 text-prussian-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Star size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Proven Success Stories</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Join hundreds of Nigerian students who have successfully transitioned to tuition-free education and thriving careers in Germany.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-slate-50 to-slate-900"></div>

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      <div className="h-24 bg-gradient-to-b from-slate-900 to-white"></div>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Widget */}
      <a 
        href="https://wa.me/2348123456789?text=Hello%20Move2Deutschland%2C%20I%20am%20interested%20in%20relocating%20to%20Germany.%20Can%20you%20help%2520me%3F" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white py-3 px-5 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <MessageCircle size={24} />
        <span className="font-medium hidden sm:block">
          Chat with a Germany Expert now
        </span>
      </a>
    </div>
  );
}
