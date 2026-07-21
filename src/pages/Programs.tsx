import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Banknote,
  Clock,
  Briefcase,
  ClipboardCheck,
  Users,
  University,
  FileText,
  Plane,
  Landmark,
  Home,
  Star,
  Award,
  Languages,
  CalendarDays,
  MapPin,
  Atom,
  CheckCircle2,
  ArrowRight,
  Quote,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ───────────────────────────── data ───────────────────────────── */

const studyTimelineSteps = [
  {
    step: 1,
    title: "Eligibility Check",
    duration: "2 mins",
    description:
      "Take our free quiz to assess your profile and find out if you qualify for tuition-free study in Germany.",
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: "Profile Assessment",
    duration: "1–2 days",
    description:
      "Our consultants review your academic records, transcripts, and English-language certifications.",
    icon: Users,
  },
  {
    step: 3,
    title: "University Matching",
    duration: "1 week",
    description:
      "We identify the best English-taught programs across German public universities that match your goals.",
    icon: University,
  },
  {
    step: 4,
    title: "Application Support",
    duration: "2–4 weeks",
    description:
      "Document prep, motivation letters, CV polishing, and uni-assist portal submission — all handled together.",
    icon: FileText,
  },
  {
    step: 5,
    title: "Visa & Blocked Account",
    duration: "4–8 weeks",
    description:
      "Embassy appointment prep, blocked account setup (€11,208), and financial documentation guidance.",
    icon: Landmark,
  },
  {
    step: 6,
    title: "Pre-Departure & Arrival",
    duration: "2 weeks",
    description:
      "Accommodation search, health insurance enrollment, airport pickup coordination, and first-week settlement.",
    icon: Plane,
  },
];

const pointsBreakdown = [
  {
    title: "Recognised Degree",
    maxPoints: 4,
    description:
      "A degree recognised in Germany or comparable via anabin database.",
    icon: GraduationCap,
  },
  {
    title: "Professional Experience",
    maxPoints: 4,
    description:
      "At least 2 years of relevant work experience in the last 5 years.",
    icon: Briefcase,
  },
  {
    title: "German Language Skills",
    maxPoints: 3,
    description:
      "B1 = 1 pt, B2 = 2 pts, C1+ = 3 pts. Proof via Goethe or telc certificate.",
    icon: Languages,
  },
  {
    title: "Age Under 35",
    maxPoints: 2,
    description:
      "Younger applicants receive bonus points reflecting long-term labour market potential.",
    icon: CalendarDays,
  },
  {
    title: "Previous Stay in Germany",
    maxPoints: 1,
    description:
      "At least 6 months of lawful residence in Germany within the past 5 years.",
    icon: MapPin,
  },
  {
    title: "STEM Qualification",
    maxPoints: 1,
    description:
      "An additional point for qualifications in science, technology, engineering, or maths.",
    icon: Atom,
  },
];

const includedItems = [
  "Personalised university/program shortlist",
  "Complete application document review",
  "Motivation letter and CV guidance",
  "Blocked account setup assistance",
  "Embassy interview preparation",
  "Pre-departure orientation",
  "Airport pickup coordination",
  "First-week settlement support",
];

/* ───────────────────────────── component ───────────────────────────── */

export default function Programs() {
  const [activeTab, setActiveTab] = useState<"study" | "opportunity">("study");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Our Programs | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Explore our relocate to Germany programs. Learn about the Tuition-Free Study Route and the new points-based Opportunity Card (Chancenkarte) visa pathway.",
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 transition-colors duration-300">
      <Navbar isAlwaysSolid />

      {/* ── Hero Banner ── */}
      <section className="pt-32 pb-20 bg-prussian-blue text-white relative overflow-hidden">
        {/* subtle decorative orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-6 md:px-12 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6"
          >
            Our Programs
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            Your Pathway to <span className="text-gold">Germany</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed"
          >
            Two proven routes to build your career in Europe's economic
            powerhouse.
          </motion.p>
        </div>
      </section>

      {/* ── Route Selector Tabs ── */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("study")}
              className={`rounded-2xl py-5 px-6 text-lg md:text-xl font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 ${
                activeTab === "study"
                  ? "bg-gold text-prussian-blue shadow-lg shadow-gold/20"
                  : "bg-white text-slate-650 border border-slate-200 hover:border-slate-300 "
              }`}
            >
              <GraduationCap size={24} />
              <span>Study Route</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("opportunity")}
              className={`rounded-2xl py-5 px-6 text-lg md:text-xl font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 ${
                activeTab === "opportunity"
                  ? "bg-gold text-prussian-blue shadow-lg shadow-gold/20"
                  : "bg-white text-slate-650 border border-slate-200 hover:border-slate-300 "
              }`}
            >
              <Award size={24} />
              <span>Opportunity Card</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "study" ? (
          <motion.div
            key="study"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Study Route — Overview Card */}
            <section className="pb-16 px-6 md:px-12">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100 "
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-prussian-blue ">
                      <GraduationCap size={28} />
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-prussian-blue ">
                      Study in Germany — Tuition-Free
                    </h2>
                  </div>

                  <p className="text-slate-605 leading-relaxed text-base md:text-lg mb-10 max-w-3xl">
                    Germany's public universities charge{" "}
                    <strong>€0 tuition</strong> for international students —
                    including Nigerians and other African nationals. Combine a
                    world-class education with a clear path to permanent
                    residency and a thriving career in Europe.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Banknote size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        Zero Tuition
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Public universities charge no tuition fees
                      </p>
                    </motion.div>

                    {/* Benefit 2 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Clock size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        18-Month Post-Study Visa
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Stay and job-hunt after graduation
                      </p>
                    </motion.div>

                    {/* Benefit 3 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Briefcase size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        Work While You Study
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Up to 20 hrs/week during term time
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Study Route — Timeline */}
            <section className="pb-24 px-6 md:px-12">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-14"
                >
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue mb-3">
                    Your Journey, Step by Step
                  </h2>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    From eligibility check to touchdown in Germany — here's
                    exactly how we get you there.
                  </p>
                </motion.div>

                <div className="relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gold/30" />

                  <div className="space-y-10">
                    {studyTimelineSteps.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.step}
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="relative flex gap-6 md:gap-8"
                        >
                          {/* Step number circle */}
                          <div className="relative z-10 shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold text-prussian-blue flex items-center justify-center font-bold text-lg md:text-xl shadow-lg shadow-gold/30">
                            {item.step}
                          </div>

                          {/* Content card */}
                          <motion.div
                            whileHover={{
                              y: -4,
                              boxShadow:
                                "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(255, 204, 0, 0.15)",
                            }}
                            className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                  <Icon size={20} />
                                </div>
                                <h3 className="font-heading text-xl font-bold text-prussian-blue ">
                                  {item.title}
                                </h3>
                              </div>
                              <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider shrink-0">
                                {item.duration}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                              {item.description}
                            </p>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="opportunity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Opportunity Card — Overview */}
            <section className="pb-16 px-6 md:px-12">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100 "
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-gold">
                      <Award size={28} />
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-prussian-blue ">
                      Germany's Chancenkarte (Opportunity Card)
                    </h2>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-10 max-w-3xl">
                    Germany's brand-new{" "}
                    <strong>points-based job-search visa</strong> lets skilled
                    professionals move to Germany for up to one year —{" "}
                    <em>without</em> needing a job offer first. Score at least 6
                    points and start your German career.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat 1 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Star size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        6 Points Needed
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Minimum threshold to qualify
                      </p>
                    </motion.div>

                    {/* Stat 2 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Clock size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        1-Year Job Search Visa
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Live and search for work in Germany
                      </p>
                    </motion.div>

                    {/* Stat 3 */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Shield size={28} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                        No Job Offer Required
                      </h3>
                      <p className="text-slate-550 text-sm">
                        Enter Germany first, then find work
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Opportunity Card — Points Breakdown */}
            <section className="pb-16 px-6 md:px-12">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-12"
                >
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue mb-3">
                    How Points Are Earned
                  </h2>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Collect at least 6 points from the categories below to
                    qualify for your Chancenkarte.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {pointsBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                        whileHover={{
                          y: -6,
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(255, 204, 0, 0.15)",
                        }}
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 flex items-start gap-5 transition-all duration-300 cursor-pointer group"
                      >
                        {/* Points badge */}
                        <div className="shrink-0 w-14 h-14 rounded-full bg-gold text-prussian-blue flex items-center justify-center font-extrabold text-lg shadow-md shadow-gold/30">
                          {item.maxPoints}
                          <span className="text-[10px] ml-0.5 font-bold">
                            pt{item.maxPoints > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-prussian-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                              <Icon size={18} />
                            </div>
                            <h3 className="font-heading text-lg font-bold text-prussian-blue ">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-slate-650 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA to opportunity-card page */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center mt-12"
                >
                  <Link to="/opportunity-card">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 40px rgba(255,204,0,0.4)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-gold/20 transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
                    >
                      View Full Opportunity Card Details
                      <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gradient divider ── */}
      <div className="h-24 bg-gradient-to-b from-slate-50 to-white " />

      {/* ── What's Included Section ── */}
      <section className="py-24 px-6 md:px-12 bg-white transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
              Full-Service Support
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
              What's Included
            </h2>
            <p className="text-slate-655 text-lg max-w-2xl mx-auto">
              Every Move2Deutschland package comes with end-to-end support — so
              you can focus on your future, not paperwork.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — Checklist */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <h3 className="font-heading text-2xl font-bold text-prussian-blue mb-6">
                What You Get
              </h3>
              {includedItems.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="flex items-start gap-4"
                >
                  <div className="shrink-0 w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                    <CheckCircle2 size={18} className="text-green-500 " />
                  </div>
                  <span className="text-slate-700 text-base md:text-lg leading-relaxed">
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Right — Testimonial Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-prussian-blue rounded-2xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                {/* decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mb-6">
                    <Quote size={24} className="text-gold" />
                  </div>

                  <p className="text-lg md:text-xl leading-relaxed mb-8 italic">
                    "Move2Deutschland made the impossible feel easy. From
                    finding the right university to setting up my blocked
                    account — they were there every step of the way. I'm now
                    studying Computer Science in Munich, tuition-free!"
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                      alt="Chinedu O."
                      className="w-12 h-12 rounded-full object-cover border-2 border-gold/40"
                    />
                    <div>
                      <p className="font-bold text-white">Chinedu O.</p>
                      <p className="text-slate-300 text-sm">
                        MSc Computer Science — TU Munich
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-6 -left-4 md:-left-8 bg-gold rounded-2xl py-4 px-6 shadow-lg shadow-gold/30"
              >
                <p className="text-prussian-blue font-bold text-sm">
                  ⭐ 4.9/5 Student Satisfaction
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Gradient divider ── */}
      <div className="h-24 bg-gradient-to-b from-white to-prussian-blue " />

      {/* ── CTA Section ── */}
      <section className="py-24 px-6 md:px-12 bg-prussian-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6">
              Let's Find Your Route
            </span>

            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              Not Sure Which Route Is{" "}
              <span className="text-gold">Right For You?</span>
            </h2>

            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Take our 2-minute eligibility quiz and we'll recommend the best
              pathway based on your education, experience, and goals.
            </p>

            <Link to="/">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(255,204,0,0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gold text-prussian-blue font-bold text-lg py-4 px-12 rounded-full shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all duration-300 cursor-pointer inline-flex items-center gap-3"
              >
                Take the Eligibility Quiz
                <ArrowRight size={22} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
