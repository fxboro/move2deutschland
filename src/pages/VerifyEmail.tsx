import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendEmailVerification, onAuthStateChanged, User } from "firebase/auth";
import { Mail, RefreshCw, LogOut, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifyEmail() {
  const [user, setUser] = useState<User | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Verify Email | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Email verification required to access your Move2Deutschland relocation portal dashboard.",
      );
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.emailVerified) {
          navigate("/dashboard");
        }
      } else {
        navigate("/auth");
      }
    });

    // Timer to check verification status every 3 seconds
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          navigate("/dashboard");
        }
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    setIsResending(true);
    setMessage(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/auth");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans relative bg-cover bg-center p-6 text-slate-800 transition-colors duration-300"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2000&auto=format&fit=crop")',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-prussian-blue/40 z-0"></div>

      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/20 blur-[100px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Mail className="text-gold" size={40} />
        </div>

        <h1 className="font-heading text-3xl font-bold text-prussian-blue mb-4">
          You're one click away from Germany!
        </h1>

        <p className="text-slate-600 mb-8 leading-relaxed">
          Please verify your email to unlock your personalized application
          portal. We've sent a confirmation link to:
          <br />
          <span className="font-bold text-prussian-blue">{user?.email}</span>
        </p>

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full bg-prussian-blue text-white font-bold py-4 px-6 rounded-xl hover:bg-prussian-blue/90 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isResending ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <RefreshCw size={20} />
            )}
            Resend Verification Email
          </button>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm font-medium ${message.includes("sent") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
            >
              {message}
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-6">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            Waiting for verification...
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200/50 flex flex-col gap-4">
          <button
            onClick={handleSignOut}
            className="text-sm font-bold text-slate-500 hover:text-prussian-blue flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign out and try another email
          </button>
        </div>
      </motion.div>
    </div>
  );
}
