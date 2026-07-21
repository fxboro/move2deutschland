import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Testimonial {
  name: string;
  route: string;
  city: string;
  university: string;
  quote: string;
  image: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Chioma Adebayo",
    route: "Lagos → Munich",
    city: "Munich",
    university: "Technical University of Munich (TUM)",
    quote:
      "Move2Deutschland made my dream of studying in Germany a reality. Zero tuition fees is not a myth! The blocked account setup was seamless, and their pre-departure checklist saved me from so much stress.",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    name: "Babajide Olumide",
    route: "Ibadan → Aachen",
    city: "Aachen",
    university: "RWTH Aachen University",
    quote:
      "I was skeptical at first, but their consultants guided me through university admissions and the German embassy interview in Lagos. Having a mentor who already lived in Germany was a game-changer.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    name: "Favour Chinedu",
    route: "Enugu → Heidelberg",
    city: "Heidelberg",
    university: "Heidelberg University",
    quote:
      "From Enugu to Heidelberg, they helped me at every step. They evaluated my WAEC results and Bachelor's transcript, found the perfect English-taught programs, and even helped me secure student accommodation.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
  {
    name: "Amina Yusuf",
    route: "Abuja → Berlin",
    city: "Berlin",
    university: "Free University of Berlin",
    quote:
      "The Opportunity Card (Chancenkarte) checklist was clear and detailed. Thanks to Move2Deutschland, I was able to compile all the points documents for my job-search visa in less than 3 weeks.",
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
  },
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const handlePrev = () => {
    stopTimer();
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
    startTimer();
  };

  const handleNext = () => {
    stopTimer();
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    startTimer();
  };

  const handleDotClick = (idx: number) => {
    stopTimer();
    setActiveIndex(idx);
    startTimer();
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,49,83,0.3),rgba(255,255,255,0))] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-4">
            Success Stories
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            From Nigeria to Germany
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Hear from real candidates who relocated successfully with our
            placement portal.
          </p>
        </div>

        <div className="relative min-h-[320px] md:min-h-[280px] flex items-center justify-center px-10 md:px-0">
          {/* Testimonial Card Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8 max-w-4xl"
            >
              {/* Profile Image & Meta */}
              <div className="flex flex-col items-center text-center shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold mb-4 shadow-lg">
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-lg text-white">
                  {testimonials[activeIndex].name}
                </h3>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase mt-1">
                  {testimonials[activeIndex].route}
                </p>
                <div className="flex gap-0.5 mt-2.5">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              {/* Quote & University Details */}
              <div className="flex flex-col gap-4 relative">
                <Quote
                  size={40}
                  className="absolute -top-4 -left-4 text-white/5 pointer-events-none"
                />
                <p className="text-slate-200 text-base md:text-lg italic leading-relaxed z-10">
                  "{testimonials[activeIndex].quote}"
                </p>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                    Location in Germany
                  </p>
                  <p className="text-sm text-slate-100 font-medium mt-1">
                    {testimonials[activeIndex].university}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left/Right Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:left-[-40px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue text-white flex items-center justify-center border border-white/10 transition-all shadow-lg hover:scale-105"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 md:right-[-40px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 hover:bg-gold hover:text-prussian-blue text-white flex items-center justify-center border border-white/10 transition-all shadow-lg hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-8 bg-gold" : "w-2.5 bg-slate-700 hover:bg-slate-600"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
