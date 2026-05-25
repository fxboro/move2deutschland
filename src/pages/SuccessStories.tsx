import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star, Play, ArrowRight, Quote, MapPin, GraduationCap, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Story {
  id: number;
  name: string;
  photo: string;
  route: string;
  university: string;
  program: string;
  year: string;
  category: 'study' | 'opportunity-card';
  rating: number;
  quote: string;
}

const stories: Story[] = [
  {
    id: 1,
    name: 'Adaeze Okonkwo',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Lagos → Munich',
    university: 'Technical University of Munich',
    program: 'M.Sc. Computer Science',
    year: '2024',
    category: 'study',
    rating: 5,
    quote: 'Move2Deutschland made my dream of studying in Germany a reality. From document preparation to university admission, they held my hand through every step. I\'m now thriving at TUM and loving life in Munich.',
  },
  {
    id: 2,
    name: 'Chinedu Amadi',
    photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Abuja → Berlin',
    university: 'Humboldt University of Berlin',
    program: 'M.A. International Relations',
    year: '2023',
    category: 'study',
    rating: 5,
    quote: 'I was skeptical at first, but the team\'s professionalism won me over. They helped me navigate the blocked account, visa interview prep, and even finding accommodation in Berlin. Worth every naira.',
  },
  {
    id: 3,
    name: 'Folake Adeyemi',
    photo: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Ibadan → Aachen',
    university: 'RWTH Aachen University',
    program: 'M.Sc. Mechanical Engineering',
    year: '2024',
    category: 'study',
    rating: 5,
    quote: 'As a female engineer, I wanted a university with world-class labs. Move2Deutschland matched me with RWTH Aachen, and the support with my scholarship application was incredible. I received a DAAD scholarship!',
  },
  {
    id: 4,
    name: 'Emeka Nwosu',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Port Harcourt → Stuttgart',
    university: 'N/A — Employed at Bosch',
    program: 'Automotive Software Engineer',
    year: '2024',
    category: 'opportunity-card',
    rating: 5,
    quote: 'The Opportunity Card route was perfect for me. With 6 years of experience, I didn\'t need another degree. The team helped me score 8 points on the Chancenkarte system and I landed a job at Bosch within 3 months of arriving.',
  },
  {
    id: 5,
    name: 'Ngozi Eze',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Enugu → Heidelberg',
    university: 'Heidelberg University',
    program: 'M.Sc. Molecular Biotechnology',
    year: '2023',
    category: 'study',
    rating: 5,
    quote: 'Heidelberg University was my first choice and Move2Deutschland helped me craft an application that stood out. The German course recommendations they gave me helped me pass my TestDaF with flying colours.',
  },
  {
    id: 6,
    name: 'Oluwaseun Bakare',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Lagos → Frankfurt',
    university: 'N/A — Employed at Deutsche Bank',
    program: 'Senior Data Analyst',
    year: '2023',
    category: 'opportunity-card',
    rating: 5,
    quote: 'I never thought moving to Germany without a job offer was possible until I heard about the Chancenkarte. The Move2Deutschland team walked me through the points system, helped with my CV in German format, and connected me with recruiters.',
  },
  {
    id: 7,
    name: 'Amina Yusuf',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Kano → Hamburg',
    university: 'University of Hamburg',
    program: 'M.Sc. Economics',
    year: '2022',
    category: 'study',
    rating: 5,
    quote: 'From the very first consultation call, I knew I was in good hands. They explained everything — uni-assist, Anabin, APS — in a way that finally made sense. Hamburg is now my home and I couldn\'t be happier.',
  },
  {
    id: 8,
    name: 'Tunde Ogundimu',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    route: 'Benin City → Dresden',
    university: 'TU Dresden',
    program: 'M.Sc. Electrical Engineering',
    year: '2022',
    category: 'study',
    rating: 5,
    quote: 'Dresden is an underrated gem and Move2Deutschland knew that. They recommended TU Dresden for my profile and it was the perfect fit — great research facilities, low cost of living, and a welcoming international community.',
  },
];

type FilterType = 'All' | 'Study Route' | 'Opportunity Card' | '2024' | '2023' | '2022';

const filters: FilterType[] = ['All', 'Study Route', 'Opportunity Card', '2024', '2023', '2022'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'text-gold fill-gold' : 'text-slate-300'}
        />
      ))}
    </div>
  );
}

function StoryCard({ story, index }: { key?: React.Key; story: Story; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 flex flex-col group cursor-default"
    >
      {/* Profile & Info Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30 flex-shrink-0">
          <img
            src={story.photo}
            alt={story.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold text-prussian-blue truncate">{story.name}</h3>
          <span className="inline-flex items-center gap-1 mt-1 py-0.5 px-2.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider">
            <MapPin size={11} />
            {story.route}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <GraduationCap size={15} className="text-prussian-blue flex-shrink-0" />
          <span className="truncate">{story.university}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-prussian-blue">{story.program}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={14} className="flex-shrink-0" />
          <span>Class of {story.year}</span>
          <span className="mx-1">·</span>
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            story.category === 'study' ? 'text-info' : 'text-success'
          }`}>
            {story.category === 'study' ? 'Study Route' : 'Opportunity Card'}
          </span>
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={story.rating} />

      {/* Quote */}
      <div className="mt-4 flex-1 relative">
        <Quote size={20} className="text-gold/30 absolute -top-1 -left-1" />
        <p className="text-slate-600 text-sm leading-relaxed pl-5 italic">
          "{story.quote}"
        </p>
      </div>
    </motion.div>
  );
}

export default function SuccessStories() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredStories = stories.filter((story) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Study Route') return story.category === 'study';
    if (activeFilter === 'Opportunity Card') return story.category === 'opportunity-card';
    // Year filters
    return story.year === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar isAlwaysSolid />

      {/* ─── Hero Banner ─── */}
      <section className="relative pt-32 pb-20 bg-prussian-blue text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6">
              Testimonials
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Success Stories
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Real students. Real journeys. Real results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Filter Bar ─── */}
      <section className="py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gold text-prussian-blue shadow-md scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-gold hover:text-prussian-blue'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stories Grid ─── */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredStories.length > 0 ? (
                filteredStories.map((story, index) => (
                  <StoryCard key={story.id} story={story} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-slate-400 text-lg">
                    No stories found for this filter. Try another category.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Gradient Divider ─── */}
      <div className="h-24 bg-gradient-to-b from-slate-50 to-slate-900" />

      {/* ─── Featured Video Section ─── */}
      <section className="py-24 px-6 md:px-12 bg-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6">
              Watch & Listen
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Hear From Our Students
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
              Nothing speaks louder than the voices of those who've walked the path before you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
          >
            {/* Thumbnail background */}
            <div className="absolute inset-0 bg-gradient-to-br from-prussian-blue via-slate-800 to-slate-900" />
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=1200&h=675&q=80"
              alt="Video testimonials coming soon"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6">
                <Play size={36} className="text-prussian-blue ml-1" fill="currentColor" />
              </div>
              <p className="text-white/80 text-lg font-semibold">
                Video testimonials coming soon
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Stay tuned for inspiring stories from our alumni
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Gradient Divider ─── */}
      <div className="h-24 bg-gradient-to-b from-slate-900 to-prussian-blue" />

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-6 md:px-12 bg-prussian-blue text-white text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold border border-gold/20 font-bold text-xs uppercase tracking-wider mb-6">
              Start Your Journey
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Your Success Story{' '}
              <span className="text-gold">Starts Here</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
              Join hundreds of Nigerian students and professionals who have successfully relocated to Germany with our guidance.
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gold text-prussian-blue font-bold text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-colors duration-300 inline-flex items-center gap-2"
              >
                Take the Eligibility Quiz
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
