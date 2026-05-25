import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, FileText, ArrowRight, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'gdpr-compliance', title: '2. GDPR & Legal Bases' },
  { id: 'data-collection', title: '3. Data We Collect' },
  { id: 'data-use', title: '4. How We Use Your Data' },
  { id: 'data-sharing', title: '5. Sharing & Disclosure' },
  { id: 'data-security', title: '6. Storage & Security' },
  { id: 'data-retention', title: '7. Data Retention' },
  { id: 'user-rights', title: '8. Your Rights (GDPR & Local)' },
  { id: 'cookies-analytics', title: '9. Cookies & Tracking' },
  { id: 'third-party-links', title: '10. Third-Party Links' },
  { id: 'changes-policy', title: '11. Changes to This Policy' },
  { id: 'contact-officer', title: '12. Data Protection Officer' },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Privacy Policy and data security guidelines for using the Move2Deutschland portal.");
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.offsetTop - 140;
      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar isAlwaysSolid />

      {/* ─── Hero Banner ─── */}
      <section className="relative pt-32 pb-16 bg-prussian-blue text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6"
            >
              <ShieldCheck size={14} />
              Privacy & Security
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4"
            >
              Privacy Policy
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-wrap items-center gap-4 text-sm text-slate-300"
            >
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-gold" />
                <span>Last Updated: May 25, 2026</span>
              </div>
              <span className="hidden md:inline text-slate-500">•</span>
              <span>Your data privacy and document security are our highest priorities.</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-16 bg-gradient-to-b from-prussian-blue to-slate-50 dark:to-slate-950" />

      {/* ─── Main Content Grid ─── */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Sidebar Navigation (Sticky) */}
            <nav className="lg:col-span-4 sticky top-28 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800/80 hidden lg:block">
              <h3 className="font-heading text-lg font-bold text-prussian-blue dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Lock size={18} className="text-gold" />
                Privacy Sections
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                        activeSection === section.id
                          ? 'bg-gold/10 dark:bg-gold/5 text-prussian-blue dark:text-gold font-bold border-l-4 border-gold pl-2'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-prussian-blue dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      <ChevronRight 
                        size={14} 
                        className={`transition-transform duration-200 ${
                          activeSection === section.id 
                            ? 'text-prussian-blue dark:text-gold translate-x-0.5' 
                            : 'text-slate-350 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                        }`} 
                      />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  GDPR Compliant
                </p>
                <p>Specifically designed to meet EU General Data Protection Regulation standards for candidates relocating to Germany.</p>
                <Link to="/terms" className="text-gold font-bold hover:underline inline-flex items-center gap-1 mt-1">
                  View Terms of Service
                  <ArrowRight size={12} />
                </Link>
              </div>
            </nav>

            {/* Document Content Area */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-lg border border-slate-100 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  1. Introduction
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  At <strong>Move2Deutschland</strong> (the "Platform", "we", "us", or "our"), your privacy is of paramount importance. Because we help African candidates seek university admissions and skilled-worker pathways in Germany, we must process sensitive personal documents (transcripts, degree certificates, passports).
                </p>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed">
                  This Privacy Policy describes how we collect, use, share, secure, and store your personal information when you visit our website, register on our student portal, or utilize our consulting services. By using our Services, you consent to the data practices described in this policy.
                </p>
              </section>

              {/* GDPR & Legal Bases */}
              <section id="gdpr-compliance" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  2. GDPR & Legal Bases for Processing
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  Since our services involve matches and placements within the Federal Republic of Germany (a member state of the European Union), we structure our data practices to comply with the <strong>General Data Protection Regulation (GDPR)</strong> alongside local regulations.
                </p>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  We process your data under the following legal bases:
                </p>
                <ul className="list-disc pl-6 text-slate-655 dark:text-slate-300 space-y-2">
                  <li><strong>Contractual Performance:</strong> To perform our services matching you to universities or processing your Chancenkarte eligibility.</li>
                  <li><strong>Consent:</strong> When you upload academic transcripts or passport data to our database. You can withdraw your consent at any time.</li>
                  <li><strong>Legitimate Interest:</strong> To secure our systems, prevent fraud, and run analytics.</li>
                </ul>
              </section>

              {/* Data We Collect */}
              <section id="data-collection" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  3. Data We Collect
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed mb-4">
                  We collect personal information directly from you to deliver comprehensive relocation and matching services.
                </p>
                
                <h3 className="text-lg font-bold text-prussian-blue dark:text-white mb-2">A. Information You Provide</h3>
                <ul className="list-disc pl-6 text-slate-650 dark:text-slate-300 space-y-2 mb-4">
                  <li><strong>Contact Details:</strong> Full name, email address, phone number (used for WhatsApp notifications), and country of residence.</li>
                  <li><strong>Academic Records:</strong> WAEC/NECO certificates, high school diplomas, university transcripts, degrees, English language scores (IELTS/TOEFL), and German language scores.</li>
                  <li><strong>Professional Records:</strong> Resumes (CVs), reference letters, and employment details (for Opportunity Card points verification).</li>
                  <li><strong>Official Credentials:</strong> A digital copy of your international passport bio-data page (required for university applications and embassy matching).</li>
                  <li><strong>Financial Data:</strong> Blocked account status, funding confirmations, and sponsorship documents.</li>
                </ul>

                <h3 className="text-lg font-bold text-prussian-blue dark:text-white mb-2">B. Information Automatically Collected</h3>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed">
                  We use cookies and standard web logging to track usage data. This includes your IP address, browser type, device information, pages visited, referral links, and duration of visit.
                </p>
              </section>

              {/* How We Use Your Data */}
              <section id="data-use" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  4. How We Use Your Data
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  We use your personal data to power our portal and provide placement assistance:
                </p>
                <ul className="list-disc pl-6 text-slate-650 dark:text-slate-300 space-y-2">
                  <li>To matching your profile with German universities and Chancenkarte requirements.</li>
                  <li>To populate, manage, and track your application checklist in our dashboard.</li>
                  <li>To provide real-time updates regarding your document validation or visa appointment statuses via email or WhatsApp messages.</li>
                  <li>To compile redacted success stories and metrics (such as "X candidates accepted in 2024").</li>
                  <li>To monitor and optimize our portal's conversion performance.</li>
                </ul>
              </section>

              {/* Sharing & Disclosure */}
              <section id="data-sharing" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  5. Sharing & Disclosure of Data
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  Move2Deutschland does <strong>NOT</strong> sell, rent, or lease your personal information to third-party advertisers. 
                </p>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  We only share your data with trusted partners when required to complete your relocation services:
                </p>
                <ul className="list-disc pl-6 text-slate-650 dark:text-slate-300 space-y-2 mb-4">
                  <li><strong>Academic Institutions & Portals:</strong> When submitting your materials to uni-assist or directly to German universities for admission evaluation.</li>
                  <li><strong>Secure Infrastructure:</strong> Firebase (Google Cloud) for hosting data, authentication, and document storage.</li>
                  <li><strong>Communication Gateways:</strong> Twilio for sending WhatsApp updates, and secure SMTP mailers for email updates.</li>
                  <li><strong>Legal Requirement:</strong> If compelled by law or to protect our legal rights, particularly in instances of fraud or fake document submission.</li>
                </ul>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed">
                  Any third parties who process data on our behalf are bound by data processing agreements (DPAs) requiring them to protect your data in accordance with GDPR guidelines.
                </p>
              </section>

              {/* Storage & Security */}
              <section id="data-security" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  6. Storage & Security
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  All personal data and files you upload (passports, transcripts) are hosted on Firebase Storage and Firestore. 
                </p>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  We use industry-standard security protocols to protect your data:
                </p>
                <ul className="list-disc pl-6 text-slate-655 dark:text-slate-300 space-y-2 mb-4">
                  <li>Encryption of data in transit using HTTPS/TLS.</li>
                  <li>Encryption of stored files at rest using AES-256 keys.</li>
                  <li>Strict Firebase security rules that prevent users from reading other candidates' files.</li>
                  <li>Restricted administrative panel access requiring verified credentials and custom claims check.</li>
                </ul>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed">
                  Please be aware that no transmission over the internet or storage method is 100% secure. While we strive to use premium security tools, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention */}
              <section id="data-retention" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  7. Data Retention
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed">
                  We retain your academic records and personal documentation for as long as your student account is active and for up to two (2) years after your relocation process is completed. This allows us to handle follow-up visa extensions or enrollment queries. You can request deletion of your data at any time (see Section 8).
                </p>
              </section>

              {/* Your Rights */}
              <section id="user-rights" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  8. Your Rights (GDPR & Local Regulations)
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed mb-4">
                  Under the GDPR and local data protection regulations, you hold the following rights:
                </p>
                <ul className="list-disc pl-6 text-slate-650 dark:text-slate-300 space-y-2 mb-4">
                  <li><strong>Right to Access:</strong> You can request a copy of all personal data and uploaded files we hold for you.</li>
                  <li><strong>Right to Rectification:</strong> You can edit your profile details at any time in the dashboard or request changes.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request that we delete all your documents and personal records from our storage.</li>
                  <li><strong>Right to Portability:</strong> You can request your documents be exported in a standardized machine-readable format.</li>
                  <li><strong>Right to Restrict Processing:</strong> You can request that we stop submitting your documents to universities while keeping them stored.</li>
                </ul>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed">
                  To exercise any of these rights, please email us at <strong>legal@move2deutschland.com</strong> with your registered account email.
                </p>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies-analytics" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  9. Cookies & Tracking Technologies
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed">
                  We use cookies to keep you signed in, understand your navigation patterns, and save your lead questionnaire progress in `localStorage` so you can resume it if interrupted. You can choose to disable cookies in your browser settings, but doing so may limit your access to certain features of the student dashboard.
                </p>
              </section>

              {/* Third-Party Links */}
              <section id="third-party-links" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  10. Third-Party Links
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed">
                  Our website may contain links to external sites such as uni-assist, the German Embassy portal, or specific German university pages. Move2Deutschland is not responsible for the privacy practices or contents of these external sites.
                </p>
              </section>

              {/* Changes to This Policy */}
              <section id="changes-policy" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-slate-655 dark:text-slate-300 leading-relaxed">
                  We reserve the right to modify this Privacy Policy at any time. When we make updates, we will revise the "Last Updated" date at the top of this document. We encourage you to review this policy periodically to stay informed about how we are securing your information.
                </p>
              </section>

              {/* Data Protection Officer */}
              <section id="contact-officer" className="scroll-mt-36">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue dark:text-white mb-4">
                  12. Data Protection Officer (DPO)
                </h2>
                <p className="text-slate-650 dark:text-slate-300 leading-relaxed mb-4">
                  If you have any questions or concerns regarding our privacy practices, or if you would like to submit a request concerning your rights, please contact our Data Protection Officer at:
                </p>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <p><strong>Move2Deutschland Data Protection Office</strong></p>
                  <p>Email: legal@move2deutschland.com</p>
                  <p>Attn: Data Privacy & Compliance</p>
                  <p>Address: Lagos, Nigeria</p>
                </div>
              </section>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
