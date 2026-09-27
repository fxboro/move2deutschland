import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Compass, ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found (404) | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "The page you are looking for does not exist on Move2Deutschland. Return to our homepage to explore tuition-free study and work opportunities in Germany.",
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-20 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          {/* Visual 404 Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest mb-6">
            Error 404 • Page Not Found
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-[#003153] mb-4 tracking-tight">
            Lost Your Way to <span className="text-[#FFCC00]">Germany?</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            The page you requested doesn’t exist, has been relocated, or the link may have expired.
            Let’s get your journey back on course.
          </p>

          {/* Quick Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#003153] text-[#FFCC00] font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-[#00223a] transition-all duration-200"
            >
              <Home size={18} />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/programs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-[#003153] font-bold px-8 py-3.5 rounded-full shadow-sm hover:border-[#003153] hover:bg-slate-50 transition-all duration-200"
            >
              <Compass size={18} />
              <span>Explore Programs</span>
            </Link>
          </div>

          {/* Helpful Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <Link
              to="/opportunity-card"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#003153]/30 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-[#003153] group-hover:text-amber-600 transition-colors">
                  Opportunity Card Quiz
                </p>
                <p className="text-xs text-slate-500">Calculate your German points</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/contact"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#003153]/30 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-[#003153] group-hover:text-amber-600 transition-colors">
                  Contact Support
                </p>
                <p className="text-xs text-slate-500">Speak with our Germany advisors</p>
              </div>
              <MessageCircle size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
