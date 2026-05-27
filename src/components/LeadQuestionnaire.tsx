import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Briefcase, Wallet, Mail, Info, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { checkIsAdmin } from '../utils/auth';

export interface SubjectGrade {
  name: string;
  grade: string;
}

interface FormData {
  academicStatus: string;
  highSchoolExam: string;
  subjects: SubjectGrade[];
  cgpa: string;
  bachelorProgram: string;
  fieldOfInterest: string;
  financialReadiness: string;
  email: string;
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
      highSchoolExam: '',
      subjects: [],
      cgpa: '',
      bachelorProgram: '',
      fieldOfInterest: '',
      financialReadiness: '',
      email: '',
    };
  });

  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdminUser = await checkIsAdmin(user);
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (step < 5) {
      localStorage.setItem('move2deutschland_lead_form', JSON.stringify({ step, formData }));
    } else {
      localStorage.removeItem('move2deutschland_lead_form');
    }
  }, [step, formData]);

  const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    // Logic: High financial readiness AND CGPA > 3.5 = High Priority
    // For High School: At least 5 subjects with A1, B2, or B3 grades.
    let hasHighGrades = false;

    if (formData.academicStatus === "High School") {
      const highGradesCount = (formData.subjects || []).filter(sub => ['A1', 'B2', 'B3'].includes(sub.grade)).length;
      if (highGradesCount >= 5) {
        hasHighGrades = true;
      }
    } else {
      const cgpaValue = parseFloat(formData.cgpa);
      if (!isNaN(cgpaValue) && cgpaValue >= 3.5) {
        hasHighGrades = true;
      }
    }

    const highPriority = ['High', 'Sponsor'].includes(formData.financialReadiness) && hasHighGrades;
    setIsHighPriority(highPriority);
    setIsSubmitting(true);

    try {
      // Check if the email already has a Firebase account
      const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
      const accountExists = signInMethods.length > 0;
      setHasExistingAccount(accountExists);

      if (accountExists) {
        // Queue branded assessment result email via Firestore /mail collection
        const resultSummary = highPriority
          ? 'Based on your academic standing and financial preparedness, you have been classified as a <strong>High-Priority Candidate</strong>. Our placement team will be in touch shortly.'
          : 'Based on the information you provided, you appear to be a strong match for the German tuition-free university pathway. We recommend proceeding with your full application.';

        await addDoc(collection(db, 'mail'), {
          to: formData.email,
          message: {
            subject: highPriority
              ? '⭐ Your Move2Deutschland Eligibility Results — High-Priority Candidate!'
              : '📋 Your Move2Deutschland Eligibility Assessment Results',
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #003153; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #FFD700; margin: 0; font-size: 28px; letter-spacing: -0.5px;">move<span style="color: #ffffff;">2</span>deutschland</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #ffffff;">
                  <h2 style="color: #003153; font-size: 22px; margin-top: 0;">Your Eligibility Assessment Results</h2>
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 40%;">Academic Status</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.academicStatus}</td>
                    </tr>
                    ${formData.academicStatus === "Bachelor's" ? `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b;">CGPA</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.cgpa} / 5.0</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Program</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.bachelorProgram}</td>
                    </tr>
                    ` : ''}
                    ${formData.academicStatus === "High School" ? `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Examination</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.highSchoolExam}</td>
                    </tr>
                    ` : ''}
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Field of Interest</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.fieldOfInterest}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Financial Readiness</td>
                      <td style="padding: 10px 0; color: #1e293b;">${formData.financialReadiness}</td>
                    </tr>
                  </table>
                  ${highPriority ? '<div style="background-color: #FFFBEB; border: 1px solid #FFD700; border-radius: 8px; padding: 12px 16px; margin: 16px 0; text-align: center;"><span style="font-weight: bold; color: #003153;">⭐ High-Priority Candidate</span></div>' : ''}
                  <p style="font-size: 15px; line-height: 1.7; color: #475569;">${resultSummary}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://move2deutschland.com/dashboard" style="display: inline-block; background-color: #FFD700; color: #003153; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Complete Your Application</a>
                  </div>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 10px 0;"><strong>Move2Deutschland</strong><br>123 Education Way, Berlin, Germany 10115</p>
                  <p style="margin: 0;">
                    <a href="https://move2deutschland.com/privacy" style="color: #003153; text-decoration: underline;">Privacy Policy</a> |
                    <a href="https://move2deutschland.com/preferences" style="color: #003153; text-decoration: underline;">Manage Preferences</a>
                  </p>
                </div>
              </div>
            `
          }
        });

        setStep(5);
        // Redirect existing user to login after showing results
        setTimeout(() => {
          setIsRedirecting(true);
          navigate('/auth');
        }, 4000);
      } else {
        // No account: save quiz data to localStorage and redirect to auth
        localStorage.setItem('move2deutschland_assessment_pending', JSON.stringify({
          formData,
          isHighPriority: highPriority,
          completedAt: new Date().toISOString()
        }));
        setStep(5);
        setTimeout(() => {
          setIsRedirecting(true);
          navigate(`/auth?redirect=dashboard&email=${encodeURIComponent(formData.email)}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking account or sending email:', error);
      // Fallback: save to localStorage and redirect to auth
      localStorage.setItem('move2deutschland_assessment_pending', JSON.stringify({
        formData,
        isHighPriority: highPriority,
        completedAt: new Date().toISOString()
      }));
      setStep(5);
      setTimeout(() => {
        setIsRedirecting(true);
        navigate(`/auth?redirect=dashboard&email=${encodeURIComponent(formData.email)}`);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
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
                        updateForm('bachelorProgram', '');
                      }
                      if (status !== "High School") {
                        updateForm('highSchoolExam', '');
                        updateForm('subjects', []);
                      } else if (!formData.subjects || formData.subjects.length === 0) {
                        // Pre-fill required base subjects for High School
                        updateForm('subjects', [
                            {name: 'Mathematics', grade: ''},
                            {name: 'English Language', grade: ''},
                            {name: '', grade: ''},
                            {name: '', grade: ''},
                            {name: '', grade: ''}
                        ]);
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
              {formData.academicStatus === "High School" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Examination Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['WAEC', 'NECO'].map((exam) => (
                        <button
                          key={exam}
                          onClick={() => updateForm('highSchoolExam', exam)}
                          className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                            formData.highSchoolExam === exam
                              ? 'border-prussian-blue bg-blue-50 text-prussian-blue shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-prussian-blue/30 hover:bg-slate-50'
                          }`}
                        >
                          {exam}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.highSchoolExam && (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subjects & Grades</label>
                      <p className="text-xs text-slate-500 mb-3 -mt-3">Enter at least 5 subjects with your grades.</p>
                      {(formData.subjects || []).map((sub, index) => (
                         <div key={index} className="flex gap-2 sm:gap-3">
                           <input 
                             type="text" 
                             placeholder="Subject (e.g. Physics)"
                             value={sub.name}
                             onChange={(e) => {
                               const newSubjects = [...formData.subjects];
                               newSubjects[index].name = e.target.value;
                               updateForm('subjects', newSubjects);
                             }}
                             className="flex-1 p-3 text-sm rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20 outline-none"
                           />
                           <select
                             value={sub.grade}
                             onChange={(e) => {
                               const newSubjects = [...formData.subjects];
                               newSubjects[index].grade = e.target.value;
                               updateForm('subjects', newSubjects);
                             }}
                             className="w-[90px] sm:w-[110px] p-3 text-sm rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20 outline-none bg-white"
                           >
                             <option value="" disabled>Grade</option>
                             <option value="A1">A1</option>
                             <option value="B2">B2</option>
                             <option value="B3">B3</option>
                             <option value="C4">C4</option>
                             <option value="C5">C5</option>
                             <option value="C6">C6</option>
                             <option value="D7">D7</option>
                             <option value="E8">E8</option>
                             <option value="F9">F9</option>
                           </select>
                           <button 
                             onClick={() => {
                               const newSubjects = formData.subjects.filter((_, i) => i !== index);
                               updateForm('subjects', newSubjects);
                             }}
                             className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                           >
                              <X size={16} />
                           </button>
                         </div>
                      ))}
                      <button 
                        onClick={() => {
                           updateForm('subjects', [...(formData.subjects || []), {name: '', grade: ''}]);
                        }}
                        className="text-sm font-medium text-prussian-blue hover:text-blue-800 flex items-center gap-1 mt-2 bg-blue-50/50 px-3 py-2 rounded-lg"
                      >
                         + Add Subject
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {formData.academicStatus === "Bachelor's" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
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
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bachelor's Program / Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Sc Computer Science"
                      value={formData.bachelorProgram}
                      onChange={(e) => updateForm('bachelorProgram', e.target.value)}
                      className="w-full p-4 rounded-xl border focus:ring-2 outline-none transition-all font-sans border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20"
                    />
                  </div>
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
              <Mail className="text-gold" size={28} />
              <h4 className="font-heading text-xl font-bold">Where should we send your results?</h4>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className={`w-full pl-11 p-4 rounded-xl border focus:ring-2 outline-none transition-all font-sans ${
                    formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                      : 'border-slate-200 focus:border-prussian-blue focus:ring-prussian-blue/20'
                  }`}
                />
              </div>
              {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                <p className="text-red-500 text-xs mt-2 font-medium">Please enter a valid email address</p>
              ) : (
                <p className="text-xs text-slate-400 mt-3">
                  We'll send your eligibility report and next steps to your email.
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
            
            {hasExistingAccount ? (
              <p className="text-slate-600 max-w-sm mx-auto">
                Your eligibility results have been sent to <strong>{formData.email}</strong>. Check your inbox for your detailed assessment report.
              </p>
            ) : (
              <p className="text-slate-600 max-w-sm mx-auto">
                You are a great fit for the German tuition-free program. Create your free account to unlock your full assessment report.
              </p>
            )}

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
                  {hasExistingAccount ? 'Redirecting to Sign In...' : 'Redirecting to Create Account...'}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {hasExistingAccount ? 'Preparing your personalized dashboard...' : 'Setting up your account...'}
                </p>
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
          const isCgpaValid = !isNaN(cgpaNum) && cgpaNum >= 1.0 && cgpaNum <= 5.0;
          return isCgpaValid && (formData.bachelorProgram || '').trim() !== '';
        } else if (formData.academicStatus === "High School") {
          if (!formData.highSchoolExam) return false;
          // Must have at least 5 populated subjects
          const validSubjects = (formData.subjects || []).filter(s => s.name.trim() !== '' && s.grade !== '');
          return validSubjects.length >= 5;
        }
        return formData.academicStatus !== '';
      }
      case 2: return formData.fieldOfInterest !== '';
      case 3: return formData.financialReadiness !== '';
      case 4: {
        // Validate email address format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(formData.email);
      }
      default: return true;
    }
  };

  if (isAdmin) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 border border-slate-100 dark:border-slate-800 text-center space-y-6 max-w-lg mx-auto transition-all">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-200/50">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-2xl font-bold text-prussian-blue dark:text-white">
            Admin Access Restricted
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            You are currently signed in as an **Administrator**. Administrators are not permitted to submit candidate eligibility applications or take the assessment test.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/admin')}
            className="bg-prussian-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-prussian-blue/90 shadow-md transition-all text-sm cursor-pointer dark:bg-gold dark:text-prussian-blue dark:hover:bg-yellow-400"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 md:p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col transition-all">
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
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
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
              disabled={!isStepValid() || isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
                isStepValid() && !isSubmitting
                  ? 'bg-gold text-prussian-blue hover:bg-yellow-400 shadow-[0_4px_14px_rgba(255,204,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,204,0,0.6)] hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-prussian-blue border-t-transparent rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                'See My Results'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
