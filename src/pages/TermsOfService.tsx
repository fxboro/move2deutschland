import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Shield,
  Scale,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: "introduction", title: "1. Introduction & Acceptance" },
  { id: "services", title: "2. Description of Services" },
  { id: "eligibility", title: "3. Candidate Eligibility" },
  { id: "user-accounts", title: "4. User Accounts & Security" },
  { id: "payments-fees", title: "5. Fees, Payments & Refunds" },
  { id: "responsibilities", title: "6. User Responsibilities & Conduct" },
  { id: "disclaimer", title: "7. Disclaimer of Guarantees" },
  { id: "intellectual-property", title: "8. Intellectual Property Rights" },
  { id: "limitation-liability", title: "9. Limitation of Liability" },
  { id: "governing-law", title: "10. Governing Law & Jurisdiction" },
  { id: "changes-terms", title: "11. Changes to These Terms" },
  { id: "contact-info", title: "12. Contact Information" },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms of Service | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Terms of Service and legal agreements for using the Move2Deutschland portal and relocation consulting services.",
      );
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.offsetTop - 140;
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 transition-colors duration-300">
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
              <Scale size={14} />
              Legal Agreements
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4"
            >
              Terms of Service
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
              <span>
                Please read these terms carefully before using our platform.
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-16 bg-gradient-to-b from-prussian-blue to-slate-50 " />

      {/* ─── Main Content Grid ─── */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Sidebar Navigation (Sticky) */}
            <nav className="lg:col-span-4 sticky top-28 bg-white rounded-2xl p-6 shadow-md border border-slate-100 hidden lg:block">
              <h3 className="font-heading text-lg font-bold text-prussian-blue mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                Table of Contents
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                        activeSection === section.id
                          ? "bg-gold/10 text-prussian-blue font-bold border-l-4 border-gold pl-2"
                          : "text-slate-650 hover:bg-slate-50 hover:text-prussian-blue "
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeSection === section.id
                            ? "text-prussian-blue translate-x-0.5"
                            : "text-slate-350 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex flex-col gap-2">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  GDPR & Privacy Compliant
                </p>
                <p>
                  We take candidate data privacy seriously. Read our companion
                  policy to understand how we secure your data.
                </p>
                <Link
                  to="/privacy"
                  className="text-gold font-bold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View Privacy Policy
                  <ArrowRight size={12} />
                </Link>
              </div>
            </nav>

            {/* Document Content Area */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-100 prose prose-slate max-w-none">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4 flex items-center gap-2">
                  1. Introduction & Acceptance of Terms
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  Welcome to <strong>Move2Deutschland</strong> (the "Platform",
                  "we", "us", or "our"). These Terms of Service ("Terms") govern
                  your access to and use of our website, mobile application, and
                  consulting services (collectively, the "Services").
                </p>
                <p className="text-slate-650 leading-relaxed mb-4">
                  By creating an account, completing our eligibility check, or
                  purchasing any consulting packages, you agree to be bound by
                  these Terms and our Privacy Policy. If you do not agree to
                  these Terms, you must immediately discontinue your use of our
                  Services.
                </p>
                <p className="text-slate-650 leading-relaxed">
                  These Terms constitute a legally binding agreement between you
                  ("User", "Candidate", or "you") and Move2Deutschland. Please
                  read them thoroughly before proceeding.
                </p>
              </section>

              {/* Description of Services */}
              <section id="services" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  2. Description of Services
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  Move2Deutschland provides relocation consulting, academic
                  placement advice, document assessment, and visa support
                  services for candidates seeking university admissions or
                  skilled-worker pathways in the Federal Republic of Germany.
                </p>
                <p className="text-slate-650 leading-relaxed mb-4">
                  Our services are split into two primary tracks:
                </p>
                <ul className="list-disc pl-6 text-slate-650 space-y-2 mb-4">
                  <li>
                    <strong>Study Route:</strong> Course matching, admission
                    requirements audit, uni-assist application review,
                    motivation letter coaching, blocked account guidance, health
                    insurance coordination, and embassy interview training.
                  </li>
                  <li>
                    <strong>Opportunity Card Route:</strong> Point calculation
                    assistance, Chancenkarte requirements verification, CV
                    optimization in German standards, cover letter tailoring,
                    and job hunt orientation.
                  </li>
                </ul>
                <p className="text-slate-650 leading-relaxed">
                  We act as independent advisors and guides. We are not an
                  affiliate of the German Embassy, the German Federal Foreign
                  Office (Auswärtiges Amt), uni-assist, or any specific German
                  university.
                </p>
              </section>

              {/* Candidate Eligibility */}
              <section id="eligibility" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  3. Candidate Eligibility
                </h2>
                <p className="text-slate-655 leading-relaxed mb-4">
                  To register an account or use our Services, you must:
                </p>
                <ul className="list-disc pl-6 text-slate-650 space-y-2 mb-4">
                  <li>
                    Be at least 18 years of age (or have explicit written
                    consent from a parent or legal guardian if under 18).
                  </li>
                  <li>
                    Possess the legal capacity to enter into binding agreements.
                  </li>
                  <li>
                    Provide accurate, current, and complete academic and
                    professional credentials.
                  </li>
                </ul>
                <p className="text-slate-650 leading-relaxed">
                  We reserve the right to decline services to any candidate
                  whose academic records, financial capacity, or documents are
                  verified to be fraudulent or insufficient to meet official
                  German migration standards.
                </p>
              </section>

              {/* User Accounts & Security */}
              <section id="user-accounts" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  4. User Accounts & Security
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  When you register on our portal, you are responsible for
                  maintaining the confidentiality of your credentials (such as
                  password or social sign-in tokens) and for restricting
                  unauthorized access to your account.
                </p>
                <p className="text-slate-650 leading-relaxed mb-4">
                  You agree to:
                </p>
                <ul className="list-disc pl-6 text-slate-650 space-y-2 mb-4">
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account.
                  </li>
                  <li>
                    Maintain an accurate and active email address and phone
                    number for critical notifications.
                  </li>
                  <li>
                    Refrain from sharing account access or transfer credentials
                    to third parties.
                  </li>
                </ul>
                <p className="text-slate-650 leading-relaxed">
                  Move2Deutschland is backed by Firebase Authentication. We
                  reserve the right to suspend or terminate accounts that
                  violate security policies or exhibit suspicious activities.
                </p>
              </section>

              {/* Fees, Payments & Refunds */}
              <section id="payments-fees" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  5. Fees, Payments & Refunds
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  While our initial eligibility questionnaire is free,
                  specialized consulting services, premium reviews, mock
                  interviews, and document translation checks are subject to the
                  pricing listed in our Service Agreement or invoice.
                </p>
                <p className="text-slate-650 leading-relaxed mb-4">
                  <strong>Refund Policy:</strong>
                </p>
                <ul className="list-disc pl-6 text-slate-650 space-y-2 mb-4">
                  <li>
                    Consulting fees are paid for our time, evaluation expertise,
                    and document processing services. Since these resources are
                    expended immediately, all fees are non-refundable once work
                    has commenced.
                  </li>
                  <li>
                    Refunds are not granted in cases where a university rejects
                    a candidate or the German Embassy denies a visa, provided
                    our advisory services were delivered in accordance with
                    agreed specifications.
                  </li>
                </ul>
                <p className="text-slate-650 leading-relaxed">
                  Any bank charges, transaction fees, or currency conversions
                  incurred during payment are the sole responsibility of the
                  candidate.
                </p>
              </section>

              {/* User Responsibilities & Conduct */}
              <section id="responsibilities" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  6. User Responsibilities & Conduct
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  Candidates are strictly required to provide authentic
                  documentation. This includes, but is not limited to,
                  WAEC/NECO/Degree certificates, university transcripts, proof
                  of language proficiency (IELTS, TOEFL, Goethe certificates),
                  and bank financial statements.
                </p>
                <div className="my-6 p-5 rounded-2xl border-l-4 border-error bg-red-50 text-slate-800 text-sm leading-relaxed">
                  <strong>CRITICAL WARNING:</strong> Submitting altered, forged,
                  or counterfeit documents is a severe offense under German and
                  local laws. If we detect fraudulent documentation, we will
                  immediately terminate your account, cease all services,
                  forfeit all fees, and reserve the right to report the
                  occurrence to relevant immigration authorities.
                </div>
                <p className="text-slate-650 leading-relaxed">
                  You agree to treat our consulting staff with respect. Any form
                  of harassment, abuse, or threats directed at our
                  representatives will result in immediate termination of
                  services.
                </p>
              </section>

              {/* Disclaimer of Guarantees */}
              <section id="disclaimer" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  7. Disclaimer of Guarantees
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  German university admissions and visa criteria are regulated
                  strictly by state education departments and the German Federal
                  Foreign Office.
                </p>
                <div className="my-6 p-5 rounded-2xl border-l-4 border-warning bg-amber-50 text-slate-800 text-sm leading-relaxed">
                  <strong>PLEASE NOTE:</strong> While we boast a high success
                  rate (e.g., 98% visa approval rate based on historical data),{" "}
                  <strong>
                    Move2Deutschland does NOT guarantee university admission or
                    visa issuance
                  </strong>
                  . The final authority to grant admission lies solely with the
                  academic institution, and the authority to issue visas lies
                  solely with the German Embassy/Consulate.
                </div>
                <p className="text-slate-650 leading-relaxed">
                  We are not liable for any losses, costs, or damages arising
                  from admission rejections or visa denials.
                </p>
              </section>

              {/* Intellectual Property Rights */}
              <section
                id="intellectual-property"
                className="scroll-mt-36 mb-12"
              >
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  8. Intellectual Property Rights
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  All contents, resources, templates, guides, checklists,
                  graphics, logos, and portal code presented on the
                  Move2Deutschland platform are the exclusive intellectual
                  property of Move2Deutschland.
                </p>
                <p className="text-slate-650 leading-relaxed">
                  You are granted a limited, personal, non-transferable, and
                  revocable license to access our materials for your own
                  personal relocation journey. Copying, distributing,
                  republishing, or selling our resources to third parties
                  without explicit written consent is strictly prohibited.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation-liability" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  To the maximum extent permitted by law, Move2Deutschland and
                  its officers, directors, employees, or partners shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages, including loss of profits, data, or
                  visa/relocation costs.
                </p>
                <p className="text-slate-650 leading-relaxed">
                  Our total cumulative liability to you for any claim arising
                  out of or in connection with our services shall be limited to
                  the amount actually paid by you to us for the specific service
                  in question.
                </p>
              </section>

              {/* Governing Law & Jurisdiction */}
              <section id="governing-law" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  10. Governing Law & Jurisdiction
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  These Terms shall be governed by, and construed in accordance
                  with, the laws of the Federal Republic of Nigeria, without
                  regard to conflict of law principles. Any dispute arising out
                  of these Terms shall be subject to the exclusive jurisdiction
                  of the competent courts in Lagos, Nigeria.
                </p>
              </section>

              {/* Changes to These Terms */}
              <section id="changes-terms" className="scroll-mt-36 mb-12">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  11. Changes to These Terms
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  We reserve the right to revise or update these Terms of
                  Service at any time. When changes are made, we will update the
                  "Last Updated" date at the top of this page. Your continued
                  use of the platform following the posting of changes
                  constitutes your acceptance of the updated Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section id="contact-info" className="scroll-mt-36">
                <h2 className="text-2xl font-heading font-bold text-prussian-blue mb-4">
                  12. Contact Information
                </h2>
                <p className="text-slate-650 leading-relaxed mb-4">
                  If you have questions, comments, or concerns about these
                  Terms, please contact our compliance officer at:
                </p>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm space-y-2 text-slate-700 ">
                  <p>
                    <strong>Move2Deutschland Legal Compliance</strong>
                  </p>
                  <p>Email: legal@move2deutschland.com</p>
                  <p>WhatsApp Support: +234 812 345 6789</p>
                  <p>Lagos Office: consultations@move2deutschland.com</p>
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
