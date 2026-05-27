import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import Logo from '../components/Logo';
import { checkIsAdmin } from '../utils/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isForgotPassword) {
      document.title = "Reset Password | Move2Deutschland";
    } else {
      document.title = isLogin ? "Sign In | Move2Deutschland" : "Create Account | Move2Deutschland";
    }
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Access the Move2Deutschland portal to complete your relocation application and track document status.");
    }
  }, [isLogin, isForgotPassword]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Please check your inbox.');
      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      handlePasswordReset(e);
      return;
    }

    if (!isLogin && !agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.emailVerified) {
          const isAdmin = await checkIsAdmin(userCredential.user);
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/verify-email');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
          await sendEmailVerification(userCredential.user);
          navigate('/verify-email');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isLogin && !agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.emailVerified) {
        const isAdmin = await checkIsAdmin(result.user);
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/verify-email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden bg-slate-900">
      {/* Background Image with slow Ken Burns effect */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            x: [0, -10, 0],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="w-full h-full bg-cover bg-center opacity-40 lg:opacity-50"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2000&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-prussian-blue via-prussian-blue/80 to-transparent z-10"></div>
      </div>

      {/* Left side - Branding (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative z-20 flex-col justify-between p-16">
        <div className="relative">
          <Logo size="xl" variant="light" className="drop-shadow-xl" />
        </div>

        <div className="max-w-xl">
          <h2 className="font-heading text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
            Your journey to a tuition-free education begins here.
          </h2>
          <p className="text-slate-200 text-lg leading-relaxed mb-8 drop-shadow-sm">
            Join hundreds of Nigerian students who have successfully relocated to Germany. Track your application, manage documents, and prepare for your visa all in one place.
          </p>

          {/* Social Proof Avatar Stack (Desktop) */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex -space-x-3 overflow-hidden">
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-prussian-blue object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-prussian-blue object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-prussian-blue object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-prussian-blue object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Student" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Join 500+ Nigerian students</p>
              <p className="text-xs text-slate-300">Already on their relocation journey</p>
            </div>
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          © {new Date().getFullYear()} Move2Deutschland operating under Buytripsnow OÜ All rights reserved. Built by <a href="https://chimadev.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-slate-300">Chima.dev</a>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative z-25 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl transition-colors duration-300">
        <Logo size="lg" variant="dark" className="absolute top-8 left-8 lg:hidden" />

        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-prussian-blue dark:hover:text-gold mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>

          {/* Social Proof Avatar Stack (Mobile Only) */}
          <div className="lg:hidden flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3.5 mb-6">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" alt="Student" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Student" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-prussian-blue dark:text-gold">Join 500+ Nigerian students</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Already on their relocation journey</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-prussian-blue dark:text-white mb-2">
              {isForgotPassword 
                ? 'Reset password' 
                : isLogin 
                  ? 'Welcome back' 
                  : 'Create an account'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isForgotPassword
                ? "Enter your email address and we'll send you a recovery link."
                : isLogin 
                  ? 'Enter your details to access your dashboard.' 
                  : 'Start your application journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isForgotPassword ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </div>
                        <input 
                          type="text" 
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                        }}
                        className="text-sm font-bold text-prussian-blue dark:text-gold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-prussian-blue dark:focus:border-gold focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {!isLogin && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className={`font-extrabold ${
                        getPasswordStrength(password).score <= 1 ? 'text-red-500' :
                        getPasswordStrength(password).score <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(getPasswordStrength(password).score / 4) * 100}%`,
                          backgroundColor: getPasswordStrength(password).score <= 1 ? '#EF4444' :
                                           getPasswordStrength(password).score <= 3 ? '#F59E0B' : '#10B981'
                        }}
                        className="h-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start mt-4"
                    >
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-2 focus:ring-prussian-blue/20 text-prussian-blue accent-prussian-blue cursor-pointer"
                        />
                      </div>
                      <label htmlFor="terms" className="ml-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                        I agree to the <Link to="/terms" className="text-prussian-blue dark:text-gold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-prussian-blue dark:text-gold hover:underline">Privacy Policy</Link>.
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-prussian-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-prussian-blue/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center group mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading 
                ? 'Please wait...' 
                : isForgotPassword 
                  ? 'Send Reset Link' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
              {!isLoading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {!isForgotPassword && (
            <>
              <div className="mt-6 flex items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button 
                onClick={handleGoogleAuth}
                className="mt-6 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:shadow transition-all flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {isForgotPassword ? (
            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsLogin(true);
                  setError(null);
                }}
                className="font-bold text-prussian-blue dark:text-gold hover:underline focus:outline-none cursor-pointer text-sm"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="font-bold text-prussian-blue dark:text-gold hover:underline focus:outline-none cursor-pointer"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
