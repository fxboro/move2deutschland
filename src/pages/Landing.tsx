import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Compass, 
  HeartHandshake, 
  Star, 
  Menu, 
  X,
  LogOut,
  ChevronDown,
  User as UserIcon,
  LayoutDashboard,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LeadQuestionnaire from '../components/LeadQuestionnaire';
import FAQ from '../components/FAQ';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-6 md:px-8 flex justify-between items-center z-50 rounded-2xl shadow-lg">
        <div className="font-heading font-bold text-2xl tracking-tight drop-shadow-md">
          move<span className="text-gold">2</span>deutschland
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold py-2 px-4 rounded-full hover:bg-white/20 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden border border-gold/30">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                  )}
                </div>
                <span className="max-w-[120px] truncate">{user.displayName || 'Account'}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-[60]"
                  >
                    <div className="p-4 border-b border-slate-100">
                      <p className="text-sm font-bold text-prussian-blue truncate">{user.displayName || 'Candidate'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-prussian-blue" />
                        Go to Dashboard
                      </Link>
                      {user.email === 'chimadayo43@gmail.com' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-gold hover:bg-gold/5 rounded-xl transition-colors"
                        >
                          <ShieldAlert size={18} />
                          Admin Portal
                        </Link>
                      )}
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/auth" className="bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold py-2 px-6 rounded-full hover:bg-white/20 transition-colors shadow-sm">
                Login
              </Link>
              <Link to="/auth" className="bg-gold/90 backdrop-blur-sm text-prussian-blue font-semibold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors shadow-sm">
                Apply Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              id="mobile-menu"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-prussian-blue/95 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col p-6 gap-4 md:hidden shadow-2xl origin-top"
              role="menu"
            >
              {user ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden border border-gold/30 shrink-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white font-bold truncate">{user.displayName || 'Candidate'}</p>
                      <p className="text-slate-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" className="w-full text-center bg-white/10 text-white border border-white/20 font-semibold py-3 px-6 rounded-xl hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold transition-all">
                    Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} role="menuitem" className="w-full text-center bg-red-500/10 text-red-400 border border-red-500/20 font-semibold py-3 px-6 rounded-xl hover:bg-red-500/20 focus:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all">
                    Sign Out
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" className="w-full text-center bg-white/10 text-white border border-white/20 font-semibold py-3 px-6 rounded-xl hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold transition-all">
                    Login
                  </Link>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" className="w-full text-center bg-gold/90 text-prussian-blue font-semibold py-3 px-6 rounded-xl hover:bg-yellow-400 focus:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-white transition-all">
                    Apply Now
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative text-white pt-20 pb-40 px-6 md:px-12 overflow-hidden"
      >
        {/* Animated Background Image */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=2000&auto=format&fit=crop")', 
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
            className="font-heading text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 mt-12"
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
              className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all duration-300 w-full sm:w-auto"
            >
              Check My Eligibility – 2 Minute Quiz
            </motion.button>
            <Link to="/opportunity-card" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 w-full"
              >
                Opportunity Card
              </motion.button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-gold">
              <Briefcase size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">18-Month Job Guarantee</h3>
            <p className="text-slate-600 leading-relaxed">
              Germany gives you 1.5 years to find a professional role after graduation.
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
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">700,000+ Vacancies</h3>
            <p className="text-slate-600 leading-relaxed">
              Germany is looking for its next generation of engineers, IT experts, and healthcare leaders.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 text-gold">
              <Globe size={32} />
            </div>
            <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-4">Citizenship</h3>
            <p className="text-slate-600 leading-relaxed">
              Germany offers a partway to citizenship in 5years, what an opportunity to contribute to Europe's economic powerhouse and the priviledge of carry a top-tier passport.
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

      {/* FAQ Section */}
      <FAQ />

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
        href="#" 
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white py-3 px-5 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300"
      >
        <MessageCircle size={24} />
        <span className="font-medium hidden sm:block">
          Chat with a Germany Expert now
        </span>
      </a>
    </div>
  );
}
