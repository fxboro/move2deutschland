import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Briefcase, Wallet, Phone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  academicStatus: string;
  cgpa: string;
  fieldOfInterest: string;
  financialReadiness: string;
  whatsapp: string;
}

export default function LeadQuestionnaire() {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('move2deutschland_lead_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.step < 5 ? parsed.step : 1;
      } catch (e) { return 1; }
    }
    return 1;
  });

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('move2deutschland_lead_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) return parsed.formData;
      } catch (e) {}
    }
    return {
      academicStatus: '',
      cgpa: '',
      fieldOfInterest: '',
      financialReadiness: '',
      whatsapp: '',
    };
  });

  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (step < 5) {
      localStorage.setItem('move2deutschland_lead_form', JSON.stringify({ step, formData }));
    } else {
      localStorage.removeItem('move2deutschland_lead_form');
    }
  }, [step, formData]);

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    // Logic: High financial readiness AND CGPA > 3.5 = High Priority
    const cgpaValue = parseFloat(formData.cgpa);
    if (['High', 'Sponsor'].includes(formData.financialReadiness) && !isNaN(cgpaValue) && cgpaValue >= 3.5) {
      setIsHighPriority(true);
    } else {
      setIsHighPriority(false);
    }
    
    setStep(5); // Move to success step

    // Simulate redirect after 3 seconds
    setTimeout(() => {
      setIsRedirecting(true);
      navigate('/auth');
    }, 3000);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 mb-6 text-prussian-blue">
              <GraduationCap className="text-gold" size={28} />
              <h4 className="font-heading text-xl font-bold">Academic Background</h4>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Academic Status</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['High School', "Bachelor's", "Master's"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateForm('academicStatus', status);
                      // Clear CGPA if they switch away from Bachelor's
                      if (status !== "Bachelor's") {
                        updateForm('cgpa', '');
                      }
                    }}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      formData.academicStatus === status
                        ? 'border-prussian-blue bg-blue-50 text-prussian-blue shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-prussian-blue/30 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {formData.academicStatus === "Bachelor's" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CGPA (e.g., 3.8 on a 5.0 scale)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    placeholder="Enter your CGPA"
                    value={formData.cgpa}
                    onChange={(e) => updateForm('cgpa', e.target.value)}
                    className={`w-full p-4 rounded-xl border focus:ring-2 outline-none transition-all font-sans ${
                      formData.cgpa && (parseFloat(formData.cgpa) < 1.0 || parseFloat(formData.cgpa) > 5.0)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                        : 'border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20'
                    }`}
                  />
                  {formData.cgpa && (parseFloat(formData.cgpa) < 1.0 || parseFloat(formData.cgpa) > 5.0) && (
                    <p className="text-red-500 text-xs mt-2 font-medium">Please enter a valid CGPA between 1.0 and 5.0</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 mb-6 text-prussian-blue">
              <Briefcase className="text-gold" size={28} />
              <h4 className="font-heading text-xl font-bold">Field of Interest</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Engineering', 'IT & Computer Science', 'Healthcare & Medicine', 'Business & Finance', 'Arts & Humanities', 'Other'].map((field) => (
                <button
                  key={field}
                  onClick={() => updateForm('fieldOfInterest', field)}
                  className={`py-4 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                    formData.fieldOfInterest === field
                      ? 'border-prussian-blue bg-blue-50 text-prussian-blue shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-prussian-blue/30 hover:bg-slate-50'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2 text-prussian-blue">
              <Wallet className="text-gold" size={28} />
              <h4 className="font-heading text-xl font-bold">Financial Readiness</h4>
            </div>
            <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              Germany requires international students to have a blocked account with{' '}
              <div className="relative inline-block group cursor-help">
                <span className="font-bold text-prussian-blue underline decoration-dotted decoration-slate-400">€11,904</span>
                <Info size={14} className="inline ml-1 text-slate-400 mb-0.5" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                  This is the "Sperrkonto" (Blocked Account) requirement set by the German government to ensure you can cover your living expenses for the first year.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>{' '}
              for their first year of living expenses.
            </p>
            
            <div className="space-y-3">
              {[
                { id: 'High', label: 'I have the €11,904 ready (Personal/Family funds).' },
                { id: 'Sponsor', label: 'I have a recognized sponsor in Germany (Verpflichtungserklärung).' },
                { id: 'Saving', label: 'I am actively saving towards this amount.' },
                { id: 'Loan', label: 'I plan to secure a student educational loan.' },
                { id: 'Scholarship', label: 'I require a full scholarship (e.g., DAAD) to proceed.' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateForm('financialReadiness', option.id)}
                  className={`w-full py-4 px-5 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-3 ${
                    formData.financialReadiness === option.id
                      ? 'border-prussian-blue bg-blue-50 text-prussian-blue shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-prussian-blue/30 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.financialReadiness === option.id ? 'border-prussian-blue' : 'border-slate-300'}`}>
                    {formData.financialReadiness === option.id && <div className="w-2.5 h-2.5 bg-prussian-blue rounded-full"></div>}
                  </div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 mb-6 text-prussian-blue">
              <Phone className="text-gold" size={28} />
              <h4 className="font-heading text-xl font-bold">Where should we send your results?</h4>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 font-medium">
                  +234
                </span>
                <input
                  type="tel"
                  placeholder="801 234 5678"
                  value={formData.whatsapp}
                  onChange={(e) => updateForm('whatsapp', e.target.value)}
                  className={`w-full p-4 rounded-r-xl border focus:ring-2 outline-none transition-all font-sans ${
                    formData.whatsapp && !/^[0-9\s\-\+]{10,15}$/.test(formData.whatsapp)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                      : 'border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20'
                  }`}
                />
              </div>
              {formData.whatsapp && !/^[0-9\s\-\+]{10,15}$/.test(formData.whatsapp) ? (
                <p className="text-red-500 text-xs mt-2 font-medium">Please enter a valid phone number (10-15 digits)</p>
              ) : (
                <p className="text-xs text-slate-400 mt-3">
                  We'll send your eligibility report and next steps directly to your WhatsApp.
                </p>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="py-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={40} />
            </motion.div>
            
            <h4 className="font-heading text-2xl font-bold text-prussian-blue">
              Profile Analyzed!
            </h4>
            
            <p className="text-slate-600 max-w-sm mx-auto">
              You are a great fit for the German tuition-free program.
            </p>

            {isHighPriority && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-gold/20 border border-gold text-prussian-blue font-bold px-4 py-2 rounded-full text-sm mt-4"
              >
                ⭐ High-Priority Candidate Tagged
              </motion.div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              {isRedirecting ? (
                <div className="flex items-center justify-center gap-2 text-prussian-blue font-medium">
                  <div className="w-5 h-5 border-2 border-prussian-blue border-t-transparent rounded-full animate-spin"></div>
                  Redirecting to Sign Up...
                </div>
              ) : (
                <p className="text-sm text-slate-500">Preparing your personalized dashboard...</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: {
        if (formData.academicStatus === "Bachelor's") {
          const cgpaNum = parseFloat(formData.cgpa);
          return !isNaN(cgpaNum) && cgpaNum >= 1.0 && cgpaNum <= 5.0;
        }
        return formData.academicStatus !== '';
      }
      case 2: return formData.fieldOfInterest !== '';
      case 3: return formData.financialReadiness !== '';
      case 4: {
        // Validate phone number: mostly digits, spaces, dashes (10-15 characters)
        const phoneRegex = /^[0-9\s\-\+]{10,15}$/;
        return phoneRegex.test(formData.whatsapp);
      }
      default: return true;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-100 relative overflow-hidden min-h-[450px] flex flex-col">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Form Content with Animation */}
      <div className="flex-grow">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="w-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step < 5 && (
        <div className="mt-12 flex justify-between items-center pt-6 border-t border-slate-100">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-prussian-blue'
            }`}
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                isStepValid() 
                  ? 'bg-prussian-blue text-white hover:bg-prussian-blue/90 shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
                isStepValid() 
                  ? 'bg-gold text-prussian-blue hover:bg-yellow-400 shadow-[0_4px_14px_rgba(255,204,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,204,0,0.6)] hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              See My Results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
