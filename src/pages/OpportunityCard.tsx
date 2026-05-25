import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase, GraduationCap, Globe, Clock, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OpportunityCard() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <Navbar isAlwaysSolid={true} />

      {/* Hero Section */}
      <section className="relative bg-prussian-blue text-white py-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/germany/1920/1080" 
            alt="Germany" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-prussian-blue/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-prussian-blue/80 via-prussian-blue/50 to-prussian-blue/90"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/20 text-gold border border-gold/30 font-bold text-sm mb-6">
              New Visa Route for Skilled Workers
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              The German Opportunity Card <br className="hidden md:block" />
              <span className="text-gold">(Chancenkarte)</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
              Your fast-track to working in Europe's largest economy. Enter Germany without a permanent job offer and take up to one year to find the perfect role.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 -mt-24 relative z-20 border border-slate-100">
          <h2 className="text-2xl md:text-3xl font-bold text-prussian-blue mb-6">What is the Opportunity Card?</h2>
          <p className="text-slate-600 mb-6 leading-relaxed text-lg">
            The Opportunity Card (Chancenkarte) makes it easier and faster for skilled professionals from non-EU countries to move to Germany. You no longer need to wait for a lengthy visa process after securing a job offer. Instead, you can travel to Germany first and look for a job locally.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <Clock className="text-prussian-blue mb-4" size={32} />
              <h3 className="font-bold text-prussian-blue mb-2">1 Year to Search</h3>
              <p className="text-sm text-slate-600">Stay in Germany for up to 12 months to find qualified employment.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <Briefcase className="text-prussian-blue mb-4" size={32} />
              <h3 className="font-bold text-prussian-blue mb-2">Work Part-Time</h3>
              <p className="text-sm text-slate-600">Work up to 20 hours per week in any job to support yourself while searching.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <Star className="text-prussian-blue mb-4" size={32} />
              <h3 className="font-bold text-prussian-blue mb-2">Trial Work</h3>
              <p className="text-sm text-slate-600">Complete up to two weeks of trial employment with potential employers.</p>
            </div>
          </div>

          <div className="text-center mb-16">
            <Link to="/">
              <button className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-1">
                Take the Self-Check Quiz
              </button>
            </Link>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-prussian-blue mb-6">How do you qualify?</h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
            There are two main ways to obtain the Opportunity Card: through direct recognition or via the points system.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-prussian-blue mb-2">Option 1: Full Recognition</h3>
                <p className="text-slate-600 leading-relaxed">
                  If your university degree or vocational qualification is fully recognized in Germany, you qualify immediately for the Opportunity Card. No points are required.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-prussian-blue mb-2">Option 2: The Points System</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  If your degree is recognized in your home country (but not yet fully in Germany), you need at least <strong>6 points</strong> to qualify. You must also prove basic language skills (A1 German or B2 English) and financial stability (approx. €1,027 per month).
                </p>
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-prussian-blue mb-4">How points are awarded:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-prussian-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                      <span className="text-slate-700"><strong>Partial recognition</strong> of your foreign qualification.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-prussian-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                      <span className="text-slate-700"><strong>Professional experience</strong> (5 years within the last 7 years) or good German language skills (B2).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-prussian-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                      <span className="text-slate-700"><strong>Age under 35</strong>, or 2 years of professional experience, or B1 German.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-prussian-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                      <span className="text-slate-700"><strong>Age 35-40</strong>, previous stays in Germany (at least 6 months), or C1 English.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-12 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] relative">
          <img 
            src="https://picsum.photos/seed/professionals/1200/600" 
            alt="Professionals working" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-prussian-blue/80 to-transparent flex items-end p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl">
              Ready to bring your skills to Europe's economic powerhouse?
            </h2>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-prussian-blue mb-6">Find out if you qualify today.</h2>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Take our quick 2-minute quiz to see if you meet the requirements for the Opportunity Card or the tuition-free study route.
        </p>
        <Link to="/">
          <button className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-1">
            Check My Eligibility Now
          </button>
        </Link>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
