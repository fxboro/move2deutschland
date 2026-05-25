import React, { useEffect, useState, useRef } from 'react';
import { Users, GraduationCap, FileCheck, Star } from 'lucide-react';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function Counter({ value, duration = 1500, prefix = '', suffix = '', decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const start = 0;
    const end = value;
    const totalFrames = Math.round(duration / 16);
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // Ease out quad
      const currentCount = start + (end - start) * easeProgress;

      setCount(currentCount);

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={elementRef}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function SocialProof() {
  const stats = [
    { label: 'Students Placed', value: 500, suffix: '+', icon: Users, color: 'text-gold' },
    { label: 'German Universities', value: 40, suffix: '+', icon: GraduationCap, color: 'text-blue-400' },
    { label: 'Visa Success Rate', value: 98, suffix: '%', icon: FileCheck, color: 'text-emerald-400' },
    { label: 'Candidate Rating', value: 4.9, prefix: '★ ', suffix: '', decimals: 1, icon: Star, color: 'text-yellow-400' },
  ];

  return (
    <div className="w-[95%] max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 md:p-10 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-gold">
                <Icon size={24} className={stat.color} />
              </div>
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-2">
                <Counter 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix} 
                  decimals={stat.decimals} 
                />
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-semibold tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
