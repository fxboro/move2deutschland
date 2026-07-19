import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Clock, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Compass, 
  AlertCircle, 
  Check, 
  Lock, 
  User, 
  HelpCircle,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { checkIsAdmin } from '../utils/auth';
import { useToast } from '../components/Toast';

export default function OpportunityCard() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  // Questionnaire state
  const [answers, setAnswers] = useState({
    hasRecognizedDegree: '',
    germanLevel: 'none',
    englishLevel: 'none',
    financialReadiness: '',
    isFullyRecognized: '',
    partialRecognition: '',
    experience: 'none',
    age: '',
    germanyStay: '',
    shortageOccupation: '',
    spouseApplying: ''
  });

  const [quizResult, setQuizResult] = useState<{
    eligible: boolean;
    reason: string;
    points: number;
    breakdown: string[];
  } | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Chancenkarte Points Calculator | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Calculate your German Opportunity Card (Chancenkarte) points based on age, education, work experience, and language skills.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdminUser = await checkIsAdmin(user);
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const calculateScore = () => {
    const hasDegree = answers.hasRecognizedDegree === 'yes';
    const hasLanguage = answers.germanLevel !== 'none' || answers.englishLevel !== 'none';
    
    if (!hasDegree || !hasLanguage) {
      return {
        eligible: false,
        reason: 'prerequisites_not_met',
        points: 0,
        breakdown: ['Mandatory prerequisites not met: Foreign degree or language proficiency missing.']
      };
    }
    
    if (answers.isFullyRecognized === 'yes') {
      return {
        eligible: true,
        reason: 'fully_recognized',
        points: 0,
        breakdown: ['Qualifications are fully recognized in Germany. Direct path eligible (no points needed).']
      };
    }
    
    let points = 0;
    const breakdown: string[] = [];
    
    // Partial Recognition (4 points)
    if (answers.partialRecognition === 'yes') {
      points += 4;
      breakdown.push('Partial recognition of foreign qualification (+4)');
    }
    
    // Professional Experience
    if (answers.experience === '5years') {
      points += 3;
      breakdown.push('Professional experience: 5+ years in the last 7 years (+3)');
    } else if (answers.experience === '2years') {
      points += 2;
      breakdown.push('Professional experience: 2+ years in the last 5 years (+2)');
    }
    
    // German Language
    if (answers.germanLevel === 'B2') {
      points += 3;
      breakdown.push('German Language: B2 or higher (+3)');
    } else if (answers.germanLevel === 'B1') {
      points += 2;
      breakdown.push('German Language: B1 (+2)');
    } else if (answers.germanLevel === 'A2') {
      points += 1;
      breakdown.push('German Language: A2 (+1)');
    }
    
    // English Language
    if (answers.englishLevel === 'C1') {
      points += 1;
      breakdown.push('English Language: C1 or higher (+1)');
    }
    
    // Age
    if (answers.age === 'under35') {
      points += 2;
      breakdown.push('Age: Under 35 years old (+2)');
    } else if (answers.age === '35to40') {
      points += 1;
      breakdown.push('Age: 35 to 40 years old (+1)');
    }
    
    // Connection to Germany
    if (answers.germanyStay === 'yes') {
      points += 1;
      breakdown.push('Connection to Germany: Legally lived for 6+ months in the last 5 years (+1)');
    }
    
    // Shortage Occupation
    if (answers.shortageOccupation === 'yes') {
      points += 1;
      breakdown.push('Shortage Occupation: Profession is a high-demand field (+1)');
    }
    
    // Spouse applying
    if (answers.spouseApplying === 'yes') {
      points += 1;
      breakdown.push('Spouse/Partner joint application (+1)');
    }
    
    return {
      eligible: points >= 6,
      reason: points >= 6 ? 'points_met' : 'points_insufficient',
      points,
      breakdown
    };
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate Step 1 has answers
      if (!answers.hasRecognizedDegree || !answers.germanLevel || !answers.englishLevel || !answers.financialReadiness) {
        toast.warning('Please answer all questions before proceeding.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!answers.isFullyRecognized) {
        toast.warning('Please answer the recognition question.');
        return;
      }
      if (answers.isFullyRecognized !== 'yes') {
        if (!answers.partialRecognition || !answers.experience || !answers.age || !answers.germanyStay || !answers.shortageOccupation || !answers.spouseApplying) {
          toast.warning('Please answer all points criteria questions.');
          return;
        }
      }
      
      const result = calculateScore();
      setQuizResult(result);
      setCurrentStep(3);
    }
  };

  const handleSaveAndRedirect = async () => {
    if (!quizResult) return;
    
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          opportunityCard: {
            score: quizResult.points,
            eligible: quizResult.eligible,
            reason: quizResult.reason,
            breakdown: quizResult.breakdown,
            answers: answers,
            calculatedAt: new Date().toISOString()
          }
        }, { merge: true });
        
        toast.success('Opportunity Card score saved successfully!');
        navigate('/dashboard');
      } catch (e) {
        console.error('Error saving Opportunity Card score:', e);
        toast.error('Failed to save score. Please try again.');
      }
    } else {
      // Save draft to localStorage and redirect to auth
      localStorage.setItem('move2deutschland_chancenkarte_form', JSON.stringify({
        score: quizResult.points,
        eligible: quizResult.eligible,
        reason: quizResult.reason,
        breakdown: quizResult.breakdown,
        answers: answers
      }));
      navigate('/auth?redirect=dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <Navbar isAlwaysSolid={true} />

      <AnimatePresence mode="wait">
        {showQuiz && isAdmin ? (
          /* Restricted Admin View */
          <motion.div
            key="admin-restricted"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="py-12 px-6 md:px-12 max-w-md mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-10 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-200/50">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-extrabold text-prussian-blue dark:text-white">Admin Access Restricted</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are currently signed in as an **Administrator**. Administrators are not permitted to use the Chancenkarte points calculator questionnaire.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full bg-prussian-blue text-white font-bold py-3.5 px-6 rounded-xl hover:bg-prussian-blue/90 shadow-md transition-all text-sm cursor-pointer dark:bg-gold dark:text-prussian-blue dark:hover:bg-yellow-400"
                >
                  Go to Admin Panel
                </button>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all text-sm cursor-pointer"
                >
                  Back to Details
                </button>
              </div>
            </div>
          </motion.div>
        ) : !showQuiz ? (
          /* Informational Landing Page View */
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <section className="relative bg-prussian-blue text-white py-24 px-6 md:px-12 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop" 
                  alt="Germany" 
                  className="w-full h-full object-cover opacity-35"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-prussian-blue/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-prussian-blue/90 via-prussian-blue/60 to-prussian-blue/95"></div>
              </div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block py-1 px-3 rounded-full bg-gold/20 text-gold border border-gold/30 font-bold text-sm mb-6 uppercase tracking-wider">
                    New Visa Route for Skilled Workers
                  </span>
                  <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    The German Opportunity Card <br className="hidden md:block" />
                    <span className="text-gold">(Chancenkarte)</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Your fast-track to working in Europe's largest economy. Enter Germany without a permanent job offer and take up to one year to find the perfect role.
                  </p>
                  <button 
                    onClick={() => {
                      setShowQuiz(true);
                      setCurrentStep(1);
                    }}
                    className="bg-gold text-prussian-blue font-extrabold text-lg py-4.5 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Take the Free Points Assessment
                  </button>
                </motion.div>
              </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 dark:border-white/10 p-8 md:p-12 -mt-24 relative z-20 transition-all">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-prussian-blue dark:text-gold mb-6">What is the Opportunity Card?</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                  The Opportunity Card (Chancenkarte) makes it easier and faster for skilled professionals from non-EU countries to move to Germany. You no longer need to wait for a lengthy visa process after securing a job offer. Instead, you can travel to Germany first and look for a job locally.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-blue-50/50 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100/50 dark:border-slate-800">
                    <Clock className="text-prussian-blue dark:text-gold mb-4" size={32} />
                    <h3 className="font-bold text-prussian-blue dark:text-white mb-2">1 Year to Search</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Stay in Germany for up to 12 months to find qualified employment.</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100/50 dark:border-slate-800">
                    <Briefcase className="text-prussian-blue dark:text-gold mb-4" size={32} />
                    <h3 className="font-bold text-prussian-blue dark:text-white mb-2">Work Part-Time</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Work up to 20 hours per week in any job to support yourself while searching.</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100/50 dark:border-slate-800">
                    <Star className="text-prussian-blue dark:text-gold mb-4" size={32} />
                    <h3 className="font-bold text-prussian-blue dark:text-white mb-2">Trial Work</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Complete up to two weeks of trial employment with potential employers.</p>
                  </div>
                </div>

                <div className="text-center mb-16">
                  <button 
                    onClick={() => {
                      setShowQuiz(true);
                      setCurrentStep(1);
                    }}
                    className="bg-gold text-prussian-blue font-extrabold text-lg py-4.5 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Take the Self-Check Quiz
                  </button>
                </div>

                <h2 className="font-heading text-2xl md:text-3xl font-bold text-prussian-blue dark:text-gold mb-6">How do you qualify?</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-lg">
                  There are two main ways to obtain the Opportunity Card: through direct recognition or via the points system.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-prussian-blue dark:text-white mb-2">Option 1: Full Recognition</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        If your university degree or vocational qualification is fully recognized in Germany, you qualify immediately for the Opportunity Card. No points are required.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-prussian-blue dark:text-white mb-2">Option 2: The Points System</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        If your degree is recognized in your home country (but not yet fully in Germany), you need at least <strong>6 points</strong> to qualify. You must also prove basic language skills (A1 German or B2 English) and financial stability (approx. €1,027 per month).
                      </p>
                      
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold text-prussian-blue dark:text-gold mb-4">How points are awarded:</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-prussian-blue dark:bg-gold text-white dark:text-prussian-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 font-heading">4</div>
                            <span className="text-slate-700 dark:text-slate-300"><strong>Partial recognition</strong> of your foreign qualification.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-prussian-blue dark:bg-gold text-white dark:text-prussian-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 font-heading">3</div>
                            <span className="text-slate-700 dark:text-slate-300"><strong>Professional experience</strong> (5 years within the last 7 years) or good German language skills (B2).</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-prussian-blue dark:bg-gold text-white dark:text-prussian-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 font-heading">2</div>
                            <span className="text-slate-700 dark:text-slate-300"><strong>Age under 35</strong>, or 2 years of professional experience, or B1 German.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-prussian-blue dark:bg-gold text-white dark:text-prussian-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 font-heading">1</div>
                            <span className="text-slate-700 dark:text-slate-300"><strong>Age 35-40</strong>, previous stays in Germany (at least 6 months), or C1 English.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-transparent to-blue-50/30 dark:to-slate-900/10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue dark:text-white mb-6">Find out if you qualify today.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
                Take our quick 2-minute quiz to see if you meet the requirements for the Opportunity Card or the tuition-free study route.
              </p>
              <button 
                onClick={() => {
                  setShowQuiz(true);
                  setCurrentStep(1);
                }}
                className="bg-gold text-prussian-blue font-extrabold text-lg py-4.5 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                Check My Eligibility Now
              </button>
            </section>
          </motion.div>
        ) : (
          /* Interactive Points Questionnaire Assessment */
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="py-12 px-6 md:px-12 max-w-2xl mx-auto"
          >
            {/* Quiz Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-full bg-gold transition-all duration-500" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>

              {/* Back to details button */}
              <button 
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    setShowQuiz(false);
                  }
                }}
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-prussian-blue dark:hover:text-gold mb-6 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} className="mr-1.5" />
                {currentStep === 1 ? 'Cancel Assessment' : 'Back'}
              </button>

              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-gold font-heading bg-gold/10 px-3 py-1 rounded-full">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Chancenkarte Points Calculator
                </span>
              </div>

              {/* STEP 1: Prerequisites Check */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-prussian-blue dark:text-white mb-2">Basic Eligibility Prerequisites</h2>
                    <p className="text-sm text-slate-500">German law requires these criteria to be met before a points assessment is calculated.</p>
                  </div>

                  {/* 1. Degree / Vocational */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      1. Do you hold a university degree or a vocational training certificate (of at least 2 years) officially recognized in your home country?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {['yes', 'no'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleInputChange('hasRecognizedDegree', val)}
                          className={`py-3 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                            answers.hasRecognizedDegree === val
                              ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                              : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. German language level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      2. What is your highest certified German language level?
                    </label>
                    <select
                      value={answers.germanLevel}
                      onChange={(e) => handleInputChange('germanLevel', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all font-semibold"
                    >
                      <option value="none">None / Below A1</option>
                      <option value="A1">A1 (Beginner)</option>
                      <option value="A2">A2 (Elementary)</option>
                      <option value="B1">B1 (Intermediate)</option>
                      <option value="B2">B2 or Higher (Upper Intermediate)</option>
                    </select>
                  </div>

                  {/* 3. English language level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      3. What is your highest certified English language level?
                    </label>
                    <select
                      value={answers.englishLevel}
                      onChange={(e) => handleInputChange('englishLevel', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all font-semibold"
                    >
                      <option value="none">None / Below B2</option>
                      <option value="B2">B2 (Vantage/Upper-Intermediate)</option>
                      <option value="C1">C1 or Higher (Advanced/Fluent)</option>
                    </select>
                  </div>

                  {/* 4. Financial assets */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      4. Do you have proof of financial stability (approx. €11,904 ready for a blocked account or a sponsor residing in Germany)?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {['yes', 'no'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleInputChange('financialReadiness', val)}
                          className={`py-3 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                            answers.financialReadiness === val
                              ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                              : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warning strip if they fail basic rules */}
                  {answers.hasRecognizedDegree === 'no' || (answers.hasRecognizedDegree && answers.germanLevel === 'none' && answers.englishLevel === 'none') ? (
                    <div className="flex gap-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs">
                      <AlertCircle size={18} className="shrink-0" />
                      <div>
                        <p className="font-bold mb-1">Prerequisite Check Failed</p>
                        <p>German immigration rules require at least a recognized degree/vocational training AND language certified proficiency (A1 German or B2 English). You may not qualify for Chancenkarte.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* STEP 2: Points evaluation */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-prussian-blue dark:text-white mb-2">Points Assessment Details</h2>
                    <p className="text-sm text-slate-500">Answer details about your career and background to tally your Chancenkarte score.</p>
                  </div>

                  {/* Recognition state */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      1. Is your foreign degree/vocational qualification fully equivalent/recognized in Germany? (e.g. checked via Anabin / ZAB)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('isFullyRecognized', 'yes')}
                        className={`py-3 px-5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          answers.isFullyRecognized === 'yes'
                            ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        Yes, Fully Recognized
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('isFullyRecognized', 'no')}
                        className={`py-3 px-5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          answers.isFullyRecognized === 'no' || answers.isFullyRecognized === 'unsure'
                            ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        No / Unsure
                      </button>
                    </div>
                  </div>

                  {/* Render points questions if not fully recognized */}
                  {answers.isFullyRecognized && answers.isFullyRecognized !== 'yes' && (
                    <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {/* Partial recognition */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          2. Do you have partial recognition of your foreign qualification in Germany? (i.e. received a formal equivalence notice showing partial equivalence)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {['yes', 'no'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleInputChange('partialRecognition', val)}
                              className={`py-3.5 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                                answers.partialRecognition === val
                                  ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Work experience */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          3. How many years of professional experience do you have in the field of your qualification?
                        </label>
                        <select
                          value={answers.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all font-semibold"
                        >
                          <option value="none">Less than 2 years</option>
                          <option value="2years">2 to 4 years (within last 5 years)</option>
                          <option value="5years">5+ years (within last 7 years)</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          4. What is your age category?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'under35', label: 'Under 35' },
                            { value: '35to40', label: '35 to 40' },
                            { value: 'over40', label: 'Over 40' }
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => handleInputChange('age', item.value)}
                              className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                answers.age === item.value
                                  ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Connection to Germany */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          5. Have you legally lived in Germany for at least 6 months consecutively in the last 5 years? (excluding tourist stays)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {['yes', 'no'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleInputChange('germanyStay', val)}
                              className={`py-3 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                                answers.germanyStay === val
                                  ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shortage occupation */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          6. Does your occupation fall under shortage categories in Germany? (MINT/STEM, IT, Medicine, Healthcare, Teaching)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {['yes', 'no'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleInputChange('shortageOccupation', val)}
                              className={`py-3 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                                answers.shortageOccupation === val
                                  ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Joint Application */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          7. Are you submitting a joint Chancenkarte application together with your spouse/partner?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {['yes', 'no'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleInputChange('spouseApplying', val)}
                              className={`py-3 px-5 rounded-xl border text-sm font-bold capitalize transition-all cursor-pointer ${
                                answers.spouseApplying === val
                                  ? 'bg-prussian-blue text-white border-prussian-blue dark:bg-gold dark:text-prussian-blue dark:border-gold shadow-md'
                                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {answers.isFullyRecognized === 'yes' && (
                    <div className="flex gap-3 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs">
                      <CheckCircle size={18} className="shrink-0" />
                      <div>
                        <p className="font-bold mb-1">Direct Pathway Eligible</p>
                        <p>Because your degree/qualification is fully recognized, you satisfy the Germany Opportunity Card conditions directly. You do not need to compile points.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Results Submission Prompt */}
              {currentStep === 3 && quizResult && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gold/15 text-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                      <Compass size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <h2 className="font-heading text-2xl font-extrabold text-prussian-blue dark:text-white mb-2">Points Tally Complete!</h2>
                    <p className="text-sm text-slate-500">We have successfully mapped your profile and calculated your score report.</p>
                  </div>

                  {currentUser ? (
                    // Logged in
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-sm">
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
                        You are logged in. Save your score assessment directly to your dashboard to unlock details.
                      </p>
                      <button
                        onClick={handleSaveAndRedirect}
                        className="w-full bg-gold text-prussian-blue font-bold py-3.5 px-6 rounded-xl hover:bg-yellow-400 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Save & View Score on Dashboard <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : (
                    // Guest needs account
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-5 shadow-sm">
                      <div className="flex gap-3 text-slate-600 dark:text-slate-300 text-xs">
                        <Lock size={18} className="shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-bold mb-0.5">Secure Your Results</p>
                          <p>To protect candidate privacy and display your point breakdown, German immigration consulting reports require account registration.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 text-slate-600 dark:text-slate-300 text-xs border-t border-slate-200/50 dark:border-slate-800 pt-3">
                        <Mail size={18} className="shrink-0 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-bold mb-0.5">Email Verification Required</p>
                          <p>A verification link will be sent to your email. You must verify your email before your Opportunity Card report is unlocked inside your candidate dashboard.</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3">
                        <button
                          onClick={handleSaveAndRedirect}
                          className="w-full bg-prussian-blue text-white font-bold py-3.5 px-6 rounded-xl hover:bg-prussian-blue/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer dark:bg-gold dark:text-prussian-blue dark:hover:bg-yellow-400"
                        >
                          <User size={18} /> Create Free Account to View Score
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('move2deutschland_chancenkarte_form', JSON.stringify({
                              score: quizResult.points,
                              eligible: quizResult.eligible,
                              reason: quizResult.reason,
                              breakdown: quizResult.breakdown,
                              answers: answers
                            }));
                            navigate('/auth');
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                          I already have an account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons at bottom */}
              {currentStep < 3 && (
                <div className="flex justify-end items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleNextStep}
                    className="bg-prussian-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-prussian-blue/90 dark:bg-gold dark:text-prussian-blue dark:hover:bg-yellow-400 shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
