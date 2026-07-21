import React from "react";
import { Award } from "lucide-react";

const universities = [
  { name: "TU München (TUM)", type: "Excellence Uni" },
  { name: "RWTH Aachen", type: "Top Engineering" },
  { name: "Heidelberg University", type: "Classic Elite" },
  { name: "HU Berlin", type: "Sciences & Tech" },
  { name: "LMU München", type: "Excellence Uni" },
  { name: "Universität Stuttgart", type: "TU9 Member" },
  { name: "Universität Köln", type: "Excellence Cluster" },
  { name: "Universität Freiburg", type: "Research Leader" },
];

export default function PartnerMarquee() {
  const displayUnis = [...universities, ...universities];

  return (
    <div className="py-10 bg-slate-100/50 border-y border-slate-200/60 overflow-hidden relative w-full">
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marqueeScroll 25s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Enter Tuition-Free Programmes at World-Class Institutions
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Soft fading overlays on left and right */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

        <div className="marquee-container gap-6 px-4">
          {displayUnis.map((uni, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl py-3 px-6 shadow-sm hover:shadow-md transition-shadow shrink-0 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                <Award size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 ">
                  {uni.name}
                </h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {uni.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
