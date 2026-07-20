import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut,
  Globe,
  Compass,
  GraduationCap,
  HelpCircle,
  PhoneCall,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Logo from './Logo';
import { checkIsAdminSync } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  isAlwaysSolid?: boolean;
}

export default function Navbar({ isAlwaysSolid = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    // Initial check for scroll
    handleScroll();

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith('#')) {
      const elementId = targetId.substring(1);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Why Germany', href: '#why-germany', icon: GraduationCap },
    { label: 'Opportunity Card', href: '/opportunity-card', icon: Compass },
    { label: 'About', href: '/about', icon: Globe },
    { label: 'Programs', href: '/programs', icon: LayoutDashboard },
    { label: 'Success Stories', href: '/success-stories', icon: Star },
    { label: 'FAQ', href: '#faq', icon: HelpCircle },
    { label: 'Contact', href: '/contact', icon: PhoneCall }
  ];

  const isSolid = isAlwaysSolid || isScrolled;

  return (
    <nav 
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl py-4 px-6 md:px-8 flex justify-between items-center z-50 rounded-2xl transition-all duration-300 ${
        isSolid 
          ? 'bg-prussian-blue/95 border border-prussian-blue/20 shadow-lg text-white' 
          : 'bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 text-white'
      }`}
    >
      {/* Brand Logo */}
      <Logo size="lg" variant="light" />

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-3 xl:gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href.startsWith('#') ? `/${link.href}` : link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-xs xl:text-sm font-semibold text-slate-100 hover:text-gold transition-colors duration-200 whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </div>
      
      {/* Desktop Actions / Auth dropdown */}
      <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer shrink-0"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
        </button>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold py-2 px-3 xl:px-4 rounded-full hover:bg-white/20 transition-all shadow-sm group text-xs xl:text-sm"
            >
              <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden border border-gold/30 shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                )}
              </div>
              <span className="max-w-[100px] xl:max-w-[120px] truncate">{user.displayName || 'Account'}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-800 overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-prussian-blue dark:text-white truncate">{user.displayName || 'Candidate'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <LayoutDashboard size={18} className="text-prussian-blue dark:text-gold" />
                      Go to Dashboard
                    </Link>
                    {checkIsAdminSync(user) && (
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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
            <Link to="/auth" className="bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold py-2 px-4 xl:px-6 rounded-full hover:bg-white/20 transition-colors shadow-sm text-xs xl:text-sm">
              Login
            </Link>
            <Link to="/auth" className="bg-gold text-prussian-blue font-bold py-2 px-4 xl:px-6 rounded-full hover:bg-yellow-400 transition-colors shadow-sm text-xs xl:text-sm">
              Apply Now
            </Link>
          </>
        )}
      </div>

      {/* Mobile / Tablet Controls (< lg) */}
      <div className="flex lg:hidden items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
        </button>

        <button 
          className="text-white p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg transition-colors cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-prussian-blue/95 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col p-6 gap-4 lg:hidden shadow-2xl origin-top z-50 text-white"
            role="menu"
          >
            {/* Mobile nav links */}
            <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.href.startsWith('#') ? `/${link.href}` : link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    role="menuitem"
                  >
                    <Icon size={18} className="text-gold" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                role="menuitem"
              >
                {theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} className="text-gold" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

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
                 {checkIsAdminSync(user) && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" className="w-full text-center bg-gold text-prussian-blue font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 focus:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-white transition-all">
                    Admin Portal
                  </Link>
                )}
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
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" className="w-full text-center bg-gold text-prussian-blue font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 focus:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-white transition-all">
                  Apply Now
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
