import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E9E2D8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2E1065] flex items-center justify-center text-[#F59E0B]">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="font-serif text-xl font-extrabold text-[#2E1065]">
                CelebrAI
              </span>
            </div>
            <p className="text-sm text-[#4B5563] max-w-sm mb-4">
              Your celebration, perfectly planned. Autonomous INR budgeting, adaptive milestone timelines, and intelligent vendor coordination.
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF]">
                100% Realistic INR
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
                Zero Double-Counting
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-[#2E1065] tracking-wider uppercase mb-3">
              Event Blueprinting
            </h4>
            <ul className="space-y-2 text-sm text-[#6B7280]">
              <li>Weddings & Royal Sangeet</li>
              <li>Milestone Birthdays</li>
              <li>Anniversary Soirées</li>
              <li>College Fests & Galas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-[#2E1065] tracking-wider uppercase mb-3">
              AI Planning Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-[#6B7280]">
              <li>Dynamic INR Allocations</li>
              <li>Contingency Safeguards</li>
              <li>Multi-Tone Invitation Drafts</li>
              <li>Executive PDF Blueprint Export</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E9E2D8] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>© {new Date().getFullYear()} CelebrAI. Plan Beautiful Moments, Effortlessly.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for memorable celebrations
          </p>
        </div>
      </div>
    </footer>
  );
};
