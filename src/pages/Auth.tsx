import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import Logo from '../components/Logo';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          if (userCredential.user.email === 'chimadayo43@gmail.com') {
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
        if (result.user.email === 'chimadayo43@gmail.com') {
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
    <div 
      className="min-h-screen flex font-sans relative bg-cover bg-center"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2000&auto=format&fit=crop")' }}
    >
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-prussian-blue/40 z-0"></div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12">
        <div className="relative z-10">
          <Logo size="xl" variant="light" className="drop-shadow-lg" />
        </div>

        <div className="relative z-10 max-w-lg drop-shadow-lg">
          <h2 className="font-heading text-4xl font-bold text-white mb-6 leading-tight">
            Your journey to a tuition-free education begins here.
          </h2>
          <p className="text-slate-100 text-lg leading-relaxed">
            Join hundreds of Nigerian students who have successfully transitioned to Germany. Track your application, manage documents, and prepare for your visa all in one place.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-white/95 backdrop-blur-2xl shadow-2xl">
        <Logo size="lg" variant="dark" className="absolute top-6 left-6 lg:hidden" />

        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-prussian-blue mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="font-heading text-3xl font-bold text-prussian-blue mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-slate-500">
              {isLogin 
                ? 'Enter your details to access your dashboard.' 
                : 'Start your application journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-prussian-blue hover:underline">
                    Forgot password?
                  </a>
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

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
                  <label htmlFor="terms" className="ml-2.5 text-sm font-medium text-slate-600 cursor-pointer">
                    I agree to the <Link to="/terms" className="text-prussian-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-prussian-blue hover:underline">Privacy Policy</Link>.
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-prussian-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-prussian-blue/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center group mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            className="mt-6 w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl hover:bg-slate-50 shadow-sm hover:shadow transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-prussian-blue hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
