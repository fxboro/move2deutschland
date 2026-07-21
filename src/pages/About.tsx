import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Target,
  Eye,
  Heart,
  Users,
  GraduationCap,
  Clock,
  UsersRound,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Animated Counter (inline, matches SocialProof pattern) ─── */
interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
}

function Counter({ value, duration = 1500, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const totalFrames = Math.round(duration / 16);
    let frame = 0;
    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const ease = progress * (2 - progress);
      setCount(Math.round(value * ease));
      if (frame < totalFrames) requestAnimationFrame(animate);
      else setCount(value);
    };
    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Data ─── */
const teamMembers = [
  {
    name: "Chima Dayo",
    role: "Founder & Lead Consultant",
    bio: "A Nigerian who relocated to Germany and navigated the system first-hand. Now dedicated to opening the same doors for others.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Amara Okonkwo",
    role: "University Admissions Specialist",
    bio: "With deep knowledge of the German university landscape, Amara matches candidates to the perfect programs for their ambitions.",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Felix Schmidt",
    role: "German Integration Advisor",
    bio: "A German national who bridges cultures, guiding candidates through bureaucracy, language milestones, and daily life in Germany.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Blessing Eze",
    role: "Visa & Documentation Expert",
    bio: "Blessing ensures every document is flawless — from blocked accounts to embassy appointments — so nothing stands in your way.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80",
  },
];

const stats = [
  { label: "Students Placed", value: 500, suffix: "+", icon: Users },
  {
    label: "Partner Universities",
    value: 40,
    suffix: "+",
    icon: GraduationCap,
  },
  { label: "Years Experience", value: 6, suffix: "+", icon: Clock },
  { label: "Team Members", value: 12, suffix: "", icon: UsersRound },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make Germany accessible to every qualified African professional and student.",
    color: "bg-blue-50  text-prussian-blue ",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "A world where geography doesn't limit opportunity.",
    color: "bg-yellow-50  text-gold",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Transparency, Excellence, and Genuine Care — in everything we do.",
    color: "bg-rose-50  text-rose-500 ",
  },
];

/* ─── Shared animation variants ─── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
};

/* ─── Page Component ─── */
export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Find out how Move2Deutschland helps Nigerian students and skilled workers relocate to Germany through tuition-free university and Opportunity Card visa programs.",
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 transition-colors duration-300">
      <Navbar isAlwaysSolid />

      {/* ═══════════════════ 1. Hero Banner ═══════════════════ */}
      <section className="pt-32 pb-20 bg-prussian-blue text-white relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6"
          >
            Our Story
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            About Move<span className="text-gold">2</span>Deutschland
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            We're on a mission to dismantle barriers and open Germany's doors to
            ambitious African professionals and students — one success story at
            a time.
          </motion.p>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-24 bg-gradient-to-b from-prussian-blue to-slate-50 " />

      {/* ═══════════════════ 2. Founder Story ═══════════════════ */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image column */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:mx-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=500&q=80"
                  alt="Chima Dayo — Founder of Move2Deutschland"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-prussian-blue/40 via-transparent to-transparent" />
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gold/20 border-2 border-gold/30 -z-10 hidden lg:block" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-prussian-blue/10 -z-10 hidden lg:block" />
            </motion.div>

            {/* Story column */}
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }}>
              <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
                Founder's Story
              </span>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue mb-6">
                From Lagos to Germany —<br className="hidden md:block" /> A
                Journey That Started It All
              </h2>

              <div className="space-y-4 text-slate-650 leading-relaxed">
                <p>
                  <strong className="text-prussian-blue ">Chima Dayo</strong>{" "}
                  arrived in Germany with a suitcase, a dream, and very little
                  guidance. Navigating the complexities of uni-assist
                  applications, blocked accounts, embassy interviews, and German
                  bureaucracy was overwhelming — and he was doing it alone.
                </p>
                <p>
                  After successfully settling in, completing his studies, and
                  building a career in Germany, Chima made a promise:{" "}
                  <em>
                    no one from Africa should have to figure this out alone
                  </em>
                  . That conviction became{" "}
                  <strong className="text-prussian-blue ">
                    Move2Deutschland
                  </strong>
                  .
                </p>
                <p>
                  Today, the platform has helped over 500 candidates secure
                  admissions, obtain visas, and start new lives in Germany — all
                  with the insider knowledge that only comes from lived
                  experience.
                </p>
              </div>

              {/* Pull-quote card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 p-6 rounded-2xl border-l-4 border-gold bg-gold/5 relative"
              >
                <Quote
                  size={28}
                  className="text-gold/30 absolute top-4 right-4"
                />
                <p className="text-prussian-blue font-medium italic leading-relaxed">
                  "I built Move2Deutschland because I believe talent is
                  universal — but opportunity is not. We're here to close that
                  gap."
                </p>
                <p className="mt-3 text-sm font-bold text-prussian-blue ">
                  — Chima Dayo, Founder
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3. Mission & Values ═══════════════════ */}
      <section className="py-24 px-6 md:px-12 bg-white transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
              What Drives Us
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
              Mission, Vision & Values
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              The principles that guide every candidate interaction and every
              success story.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 49, 83, 0.08), 0 0 0 2px rgba(255, 204, 0, 0.15)",
                  }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center group transition-all duration-300 cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-prussian-blue mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 4. Team Section ═══════════════════ */}
      <section className="py-24 px-6 md:px-12 bg-slate-50 ">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
              The People Behind the Mission
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-prussian-blue mb-4">
              Meet Our Team
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              A dedicated crew of consultants, advisors, and experts who've
              walked the path themselves.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 40px -10px rgba(0, 49, 83, 0.12), 0 0 0 2px rgba(255, 204, 0, 0.15)",
                }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center group transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-gold/40 transition-colors duration-300 shadow-md">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Online dot */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white " />
                </div>

                <h3 className="font-heading text-lg font-bold text-prussian-blue mb-1">
                  {member.name}
                </h3>
                <p className="text-gold font-semibold text-xs uppercase tracking-wider mb-4">
                  {member.role}
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5. Company Stats ═══════════════════ */}
      <section className="py-20 px-6 md:px-12 bg-slate-900 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-60 h-60 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-prussian-blue/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
              Our Impact in Numbers
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Every number represents a life changed, a barrier broken, and a
              dream realized.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon size={26} className="text-gold" />
                  </div>
                  <div className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-2">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs md:text-sm text-slate-400 font-semibold tracking-wider uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 6. CTA Section ═══════════════════ */}
      <section className="py-24 px-6 md:px-12 bg-prussian-blue relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,204,0,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.04),transparent_50%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6"
          >
            Take the First Step
          </motion.span>

          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight"
          >
            Ready to Start Your
            <br className="hidden sm:block" /> Journey to Germany?
          </motion.h2>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Take our free 2-minute eligibility quiz and discover the best
            pathway to tuition-free education or a skilled-worker visa in
            Germany.
          </motion.p>

          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.3 }}>
            <Link to="/#questionnaire">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(255,204,0,0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all duration-300 cursor-pointer"
              >
                Check My Eligibility — It's Free
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-8 text-slate-400 text-sm"
          >
            Trusted by <span className="text-gold font-semibold">500+</span>{" "}
            students across Nigeria, Ghana, Kenya & beyond.
          </motion.p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
