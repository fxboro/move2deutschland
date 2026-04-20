import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, GraduationCap, Briefcase, TrendingUp, Compass, HeartHandshake, Star } from 'lucide-react';
import LeadQuestionnaire from '../components/LeadQuestionnaire';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full bg-transparent text-white py-6 px-6 md:px-12 flex justify-between items-center z-50">
        <div className="font-heading font-bold text-2xl tracking-tight">
          move<span className="text-gold">2</span>deutschland
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="hidden md:block bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 px-6 rounded-full hover:bg-white/20 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="hidden md:block bg-gold text-prussian-blue font-semibold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative text-white pt-32 pb-40 px-6 md:px-12 overflow-hidden"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=2000&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-prussian-blue/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-prussian-blue/70 via-prussian-blue/40 to-prussian-blue/80"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Your Global Leap Starts in Germany. <br className="hidden md:block" />
            <span className="text-gold">0 Tuition. 100% Opportunity.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            <strong>Stop dreaming</strong>, start planning your career. Move to Europe's economic powerhouse via tuition-free study or point based opportunity card for skilled workers routes.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => document.getElementById('questionnaire')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,204,0,0.4)] hover:shadow-[0_0_30px_rgba(255,204,0,0.6)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              Check My Eligibility – 2 Minute Quiz
            </button>
            <Link to="/opportunity-card" className="w-full sm:w-auto">
              <button 
                className="bg-transparent border-2 border-white text-white font-bold text-lg py-4 px-10 rounded-full hover:bg-white/10 transition-all duration-300 w-full"
              >
                Opportunity Card
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Integration Point: Lead Qualification Questionnaire */}
      <section id="questionnaire" className="relative -mt-24 z-20 px-6 md:px-12 max-w-3xl mx-auto">
        <LeadQuestionnaire />
      </section>

      {/* The Logic Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto mt-12">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
            Why Germany is the Smart Choice
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            The most secure, logical path to international success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-prussian-blue">
              <GraduationCap size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">Zero-Tuition</h3>
            <p className="text-slate-600 leading-relaxed">
              Public universities in Germany charge €0 tuition. Invest your money in your life, not just a degree.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-prussian-blue">
              <Briefcase size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">18-Month Visa</h3>
            <p className="text-slate-600 leading-relaxed">
              Guaranteed post-study work visa to find a job in Europe's strongest economy.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-prussian-blue">
              <TrendingUp size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">Clear PR Path</h3>
            <p className="text-slate-600 leading-relaxed">
              Structured pathways to Permanent Residency and Citizenship for skilled graduates.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Comparison Component */}
      <section className="py-24 px-6 md:px-12 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
              The Numbers Don't Lie
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Compare Germany against traditional destinations.
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-800">
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="p-4 md:p-6 bg-slate-50 font-heading font-bold text-sm md:text-lg flex items-center justify-center text-center">Feature</div>
              <div className="p-4 md:p-6 bg-slate-100 font-heading font-bold text-sm md:text-lg text-center border-l border-slate-200">UK / USA<br/><span className="text-xs md:text-sm text-red-500 font-normal">High Risk</span></div>
              <div className="p-4 md:p-6 bg-gold/10 font-heading font-bold text-sm md:text-lg text-center border-l border-slate-200 text-prussian-blue">Germany<br/><span className="text-xs md:text-sm text-green-600 font-normal">High Stability</span></div>
            </div>
            
            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Tuition Fees</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-red-600 font-semibold text-sm md:text-base">£15k - $40k / year</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-green-600 font-bold text-lg md:text-xl">€0</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Post-Study Visa</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-slate-600 text-sm md:text-base">Strict / Expensive</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-prussian-blue font-semibold text-sm md:text-base">18 Months Guaranteed</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Job Market</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-slate-600 text-sm md:text-base">Saturated</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-prussian-blue font-semibold text-sm md:text-base">700k+ Openings</div>
            </div>

            <div className="grid grid-cols-3 relative hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 transition-all duration-300 cursor-pointer">
              <div className="p-4 md:p-6 font-medium flex items-center text-sm md:text-base">Path to PR</div>
              <div className="p-4 md:p-6 border-l border-slate-100 flex items-center justify-center text-center text-red-600 font-medium text-sm md:text-base">Complex & Uncertain</div>
              <div className="p-4 md:p-6 border-l border-slate-100 bg-gold/5 flex items-center justify-center text-center text-green-600 font-bold text-sm md:text-base">Clear & Structured</div>
            </div>
          </div>
        </div>
      </section>

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
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 text-prussian-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Expert Guidance</h3>
              <p className="text-slate-600 leading-relaxed">
                Navigate the complex German university system and visa process with consultants who have successfully done it themselves.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-yellow-50 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartHandshake size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Personalized Support</h3>
              <p className="text-slate-600 leading-relaxed">
                From university selection to finding accommodation and opening your blocked account, we are with you at every step.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 text-prussian-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">Proven Success Stories</h3>
              <p className="text-slate-600 leading-relaxed">
                Join hundreds of Nigerian students who have successfully transitioned to tuition-free education and thriving careers in Germany.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 md:px-12 text-center">
        <div className="font-heading font-bold text-2xl tracking-tight text-white mb-6">
          move<span className="text-gold">2</span>deutschland
        </div>
        <p className="mb-6 max-w-md mx-auto">
          Empowering Nigerian students to achieve their global career goals through tuition-free education in Germany.
        </p>
        <p className="text-sm">
          © {new Date().getFullYear()} Move2Deutschland. All rights reserved.
        </p>
      </footer>

      {/* Floating WhatsApp Widget */}
      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
