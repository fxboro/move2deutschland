import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  Clock,
  MapPin,
  Send,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Phone,
  User,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ───────────────────────── types / data ───────────────────────── */

interface ContactCard {
  icon: React.ReactNode;
  title: string;
  detail: string;
  sub: string;
  href?: string;
  external?: boolean;
}

const contactCards: ContactCard[] = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Chat on WhatsApp',
    detail: '+234 812 345 6789',
    sub: 'Quick replies within 2 hours',
    href: 'https://wa.me/2348123456789?text=Hello%20Move2Deutschland',
    external: true,
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Send an Email',
    detail: 'info@move2deutschland.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:info@move2deutschland.com',
    external: false,
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Office Hours',
    detail: 'Monday – Friday: 9 AM – 5 PM (WAT)',
    sub: 'Saturday: 10 AM – 2 PM (WAT)',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Our Office',
    detail: 'Lagos, Nigeria (Consultations)',
    sub: 'Germany (Operations)',
  },
];

const faqQuickLinks = [
  'How much does the service cost?',
  'Do I need to speak German?',
  'What documents do I need?',
  'How long does the process take?',
];

const subjectOptions = [
  'General Inquiry',
  'Study Route',
  'Opportunity Card',
  'Visa Support',
  'Partnership',
];

/* ────────────────── animation helpers ────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════
   Contact Page
   ═══════════════════════════════════════════════════════ */

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Us | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Get in touch with Move2Deutschland. Send us a message, chat with us on WhatsApp, or email us for study in Germany & Opportunity Card visa assistance.");
    }
  }, []);

  /* ── form state ── */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (!subject) next.subject = 'Please select a subject.';
    if (!message.trim()) next.message = 'Message is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  /* ────────── input classes ────────── */
  const inputCls =
    'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-sm text-slate-900 dark:text-slate-100';
  const labelCls = 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar isAlwaysSolid />

      {/* ───────── 1. Hero Banner ───────── */}
      <section className="pt-32 pb-20 bg-prussian-blue text-white relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6"
          >
            Contact Us
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            Get In Touch
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
          >
            Have questions about relocating to Germany? We are here to help.
          </motion.p>
        </div>
      </section>

      {/* gradient divider */}
      <div className="h-24 bg-gradient-to-b from-prussian-blue to-slate-50 dark:to-slate-950" />

      {/* ───────── 2. Contact Grid ───────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Left: Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-850">
              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-16 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                    Message Sent!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    Thank you, {fullName.split(' ')[0]}! We've received your
                    message and will get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFullName('');
                      setEmail('');
                      setPhone('');
                      setSubject('');
                      setMessage('');
                      setErrors({});
                    }}
                    className="mt-4 text-sm font-semibold text-gold hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                /* ── Form ── */
                <>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-1">
                    Send Us a Message
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Fill in the form below and we'll respond as soon as
                    possible.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className={labelCls}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          id="fullName"
                          type="text"
                          aria-required="true"
                          aria-invalid={!!errors.fullName}
                          aria-describedby={
                            errors.fullName ? 'fullName-err' : undefined
                          }
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                      {errors.fullName && (
                        <p
                          id="fullName-err"
                          className="text-red-500 text-xs mt-1"
                        >
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          id="email"
                          type="email"
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={
                            errors.email ? 'email-err' : undefined
                          }
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                      {errors.email && (
                        <p id="email-err" className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className={labelCls}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+234 800 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className={labelCls}>
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          id="subject"
                          aria-required="true"
                          aria-invalid={!!errors.subject}
                          aria-describedby={
                            errors.subject ? 'subject-err' : undefined
                          }
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={`${inputCls} pl-10 pr-10 appearance-none cursor-pointer`}
                        >
                          <option value="">Select a subject…</option>
                          {subjectOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.subject && (
                        <p
                          id="subject-err"
                          className="text-red-500 text-xs mt-1"
                        >
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className={labelCls}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={
                          errors.message ? 'message-err' : undefined
                        }
                        placeholder="Tell us how we can help you…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={inputCls}
                      />
                      {errors.message && (
                        <p
                          id="message-err"
                          className="text-red-500 text-xs mt-1"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl bg-gold text-prussian-blue font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-md cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Right: Info Cards ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-5"
          >
            {contactCards.map((card, i) => {
              const inner = (
                <>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg mb-0.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {card.detail}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{card.sub}</p>
                  </div>
                  {card.href && (
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  )}
                </>
              );

              const cls =
                'group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-850 hover:shadow-lg hover:border-gold/20 transition-all duration-300 flex items-center gap-5';

              return (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  {card.href ? (
                    <a
                      href={card.href}
                      target={card.external ? '_blank' : undefined}
                      rel={
                        card.external ? 'noopener noreferrer' : undefined
                      }
                      className={cls}
                      aria-label={card.title}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </motion.div>
              );
            })}

            {/* Extra trust message */}
            <motion.div
              variants={fadeUp}
              custom={contactCards.length}
              className="mt-2 bg-prussian-blue/5 dark:bg-prussian-blue/10 rounded-2xl p-6 border border-prussian-blue/10 dark:border-slate-800 text-center"
            >
              <p className="text-sm text-slate-650 dark:text-slate-300">
                🇩🇪 We've helped{' '}
                <span className="font-bold text-prussian-blue dark:text-gold">500+</span>{' '}
                candidates start their journey to Germany.{' '}
                <span className="font-semibold text-prussian-blue dark:text-gold">
                  Your story could be next.
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────── 3. FAQ Quick Links ───────── */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white">
              Looking for quick answers?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto text-sm">
              Check out our most commonly asked questions — or reach out
              directly using the form above.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
          >
            {faqQuickLinks.map((q, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <Link
                  to="/#faq"
                  className="group flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-gold/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
                    {q}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── 4. Map Placeholder ───────── */}
      <section className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white">
              Find Us
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
              Lagos, Nigeria · Germany
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg h-72 md:h-96"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(0,49,83,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f8fafc] dark:bg-slate-900">
              <div className="w-16 h-16 rounded-full bg-prussian-blue/5 dark:bg-white/5 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-prussian-blue/40 dark:text-gold/40" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">
                Map coming soon
              </p>
              <p className="text-slate-350 dark:text-slate-500 text-xs">
                Google Maps integration will appear here
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── CTA Section ───────── */}
      <section className="py-24 px-6 md:px-12 bg-prussian-blue text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6">
            Start Today
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto">
            Whether you're exploring your options or ready to take the next
            step, our team is here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-prussian-blue font-bold rounded-xl hover:brightness-105 transition-all shadow-lg cursor-pointer"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/2348123456789?text=Hello%20Move2Deutschland"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
