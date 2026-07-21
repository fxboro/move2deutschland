import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { auth } from "../firebase";
import Logo from "../components/Logo";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [isVerifying, setIsVerifying] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Reset Password | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Choose a new password for your Move2Deutschland relocation application account.",
      );
    }

    if (!oobCode) {
      setVerificationError(
        "Missing password reset code. Please request a new link.",
      );
      setIsVerifying(false);
      return;
    }

    // Verify action code on mount
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setIsVerifying(false);
      })
      .catch((err: any) => {
        setVerificationError(
          err.message || "The password reset link is invalid or has expired.",
        );
        setIsVerifying(false);
      });
  }, [oobCode]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score === 2 || score === 3)
      return { score, label: "Medium", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      // Automatically redirect after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-slate-900">
      {/* Background Image with slow Ken Burns effect */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            x: [0, -10, 0],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="w-full h-full bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2000&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-prussian-blue via-prussian-blue/80 to-transparent z-10"></div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 p-8 md:p-10 relative z-20 text-slate-900 transition-colors duration-300"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" variant="dark" />
        </div>

        {isVerifying ? (
          <div className="text-center py-10">
            <RefreshCw
              size={40}
              className="animate-spin text-prussian-blue mx-auto mb-4"
            />
            <p className="text-slate-500 font-semibold">
              Verifying your reset link...
            </p>
          </div>
        ) : verificationError ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 ">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-prussian-blue ">
              Link Verification Failed
            </h2>
            <p className="text-slate-500 mb-8">{verificationError}</p>
            <Link
              to="/auth"
              className="inline-flex items-center text-sm font-bold text-prussian-blue hover:underline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        ) : success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 ">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-prussian-blue ">
              Password Updated!
            </h2>
            <p className="text-slate-500 mb-8">
              Your password has been reset successfully. You will be redirected
              to the login page shortly...
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full bg-prussian-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-prussian-blue/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center group"
            >
              Go to Sign In
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-prussian-blue mb-2">
              Choose new password
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Enter a strong, secure new password for{" "}
              <span className="font-bold text-prussian-blue ">{email}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Password Strength:</span>
                      <span
                        className={`font-extrabold ${
                          getPasswordStrength(password).score <= 1
                            ? "text-red-500"
                            : getPasswordStrength(password).score <= 3
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(getPasswordStrength(password).score / 4) * 100}%`,
                          backgroundColor:
                            getPasswordStrength(password).score <= 1
                              ? "#EF4444"
                              : getPasswordStrength(password).score <= 3
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                        className="h-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 ">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-prussian-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-prussian-blue/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center group disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
                {!isLoading && (
                  <ArrowRight
                    size={18}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/auth"
                className="font-bold text-prussian-blue hover:underline focus:outline-none cursor-pointer text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
