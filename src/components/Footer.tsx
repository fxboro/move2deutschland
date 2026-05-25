import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith('#') && location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter! We will keep you updated.');
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-800 relative z-10">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Logo size="xl" variant="light" />
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Empowering African and Nigerian candidates to transition to tuition-free education and high-paying careers in Germany. The smart, reliable pathway to Europe.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue flex items-center justify-center text-slate-300 transition-all duration-300" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue flex items-center justify-center text-slate-300 transition-all duration-300" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue flex items-center justify-center text-slate-300 transition-all duration-300" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue flex items-center justify-center text-slate-300 transition-all duration-300" aria-label="Instagram">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Programs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-heading font-bold text-white text-lg tracking-wider uppercase">Routes</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <Link to="/programs" className="hover:text-gold transition-colors duration-200 text-sm">Study Route</Link>
            </li>
            <li>
              <Link to="/opportunity-card" className="hover:text-gold transition-colors duration-200 text-sm">Opportunity Card</Link>
            </li>
            <li>
              <Link to="/programs" className="hover:text-gold transition-colors duration-200 text-sm">Language Prep</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-heading font-bold text-white text-lg tracking-wider uppercase">Portal</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <Link to="/about" className="hover:text-gold transition-colors duration-200 text-sm">About Us</Link>
            </li>
            <li>
              <Link to="/success-stories" className="hover:text-gold transition-colors duration-200 text-sm">Success Stories</Link>
            </li>
            <li>
              <Link to="/#faq" onClick={(e) => handleNavClick(e, '#faq')} className="hover:text-gold transition-colors duration-200 text-sm">FAQs</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold transition-colors duration-200 text-sm">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Info & Newsletter */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-white text-lg tracking-wider uppercase">Stay Updated</h3>
            <p className="text-sm text-slate-400">
              Get the latest intake deadlines, blocked account updates, and visa guidance.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              className="bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-gold focus:outline-none px-4 py-2.5 rounded-xl text-sm flex-grow transition-all"
            />
            <button 
              type="submit" 
              className="bg-gold hover:bg-yellow-400 text-prussian-blue font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0"
              aria-label="Subscribe"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail size={16} className="text-gold" />
              <span>info@move2deutschland.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone size={16} className="text-gold" />
              <span>+234 812 345 6789</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 relative z-10">
        <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>© {currentYear} Move2Deutschland. All rights reserved.</span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span>
            built by{' '}
            <a 
              href="https://chimadev.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gold hover:underline font-semibold"
            >
              Chima.dev
            </a>{' '}
            - Software, Web, AI & Workflow automation
          </span>
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
