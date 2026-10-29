import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Cake, 
  Award, 
  GraduationCap, 
  FileDown, 
  ShieldCheck, 
  Clock, 
  Users, 
  Banknote,
  Send,
  CalendarCheck
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface LandingViewProps {
  onNavigate: (view: string, eventId?: string, extra?: string) => void;
  sampleEventId?: string;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, sampleEventId }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-20 bg-[radial-gradient(ellipse_at_80%_20%,rgba(244,63,94,0.08)_0%,rgba(245,158,11,0.08)_35%,rgba(250,247,242,1)_70%)] border-b border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border border-[#E9E2D8] px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="text-[#F59E0B]">
                  <Sparkles className="w-4 h-4 fill-current" />
                </span>
                <span className="text-xs font-bold text-[#2E1065]">
                  AI-Powered Event Intelligence
                </span>
                <span className="bg-[#FAF5FF] text-[#5B21B6] text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-[#F3E8FF]">
                  GENAI
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#2E1065] leading-[1.12]">
                Your Celebration, <br />
                <span className="bg-gradient-to-r from-[#2E1065] via-[#E11D48] to-[#D97706] bg-clip-text text-transparent">
                  Perfecty Planned.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-xl">
                Plan beautiful moments, effortlessly. From regal Indian weddings and milestone birthdays to high-energy college fests and festive galas — CelebrAI crafts bespoke budgets in INR, adaptive timelines, and complete vendor strategies in seconds.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate('create')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span>Create My Event Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {sampleEventId && (
                  <button
                    onClick={() => onNavigate('workspace', sampleEventId)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-base font-bold bg-white text-[#2E1065] border border-[#E9E2D8] hover:bg-[#FAF7F2] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>View Sample Blueprint</span>
                  </button>
                )}
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E9E2D8]">
                <div>
                  <div className="text-2xl font-black text-[#2E1065]">100%</div>
                  <div className="text-xs text-[#6B7280] font-medium">Realistic INR Estimates</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#2E1065]">Zero</div>
                  <div className="text-xs text-[#6B7280] font-medium">Contingency Double-Counting</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#2E1065]">1-Click</div>
                  <div className="text-xs text-[#6B7280] font-medium">Executive PDF Export</div>
                </div>
              </div>
            </div>

            {/* Right Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E9E2D8] shadow-xl relative hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7] mb-2">
                      Wedding Showcase
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#2E1065]">
                      Aarav & Diya's Royal Sangeet
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Udaipur, Rajasthan • 120 Guests
                    </p>
                  </div>
                  <span className="bg-[#FAF5FF] text-[#2E1065] font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-xl border border-[#F3E8FF] whitespace-nowrap">
                    ₹5,00,000
                  </span>
                </div>

                {/* Metric mini-cards */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl text-center border border-[#E9E2D8]">
                    <div className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">
                      Venue
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#2E1065] mt-0.5">
                      ₹1,40,000
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl text-center border border-[#E9E2D8]">
                    <div className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">
                      Catering
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#2E1065] mt-0.5">
                      ₹1,50,000
                    </div>
                  </div>
                  <div className="bg-[#FFFBEB] p-2.5 rounded-xl text-center border border-[#FEF3C7]">
                    <div className="text-[10px] text-[#B45309] uppercase font-bold tracking-wider">
                      Contingency
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#B45309] mt-0.5">
                      ₹35,000
                    </div>
                  </div>
                </div>

                {/* Milestones Snippet */}
                <div className="border-t border-[#E9E2D8] pt-4 mb-5">
                  <div className="text-xs font-bold text-[#2E1065] mb-2 flex items-center justify-between">
                    <span>Upcoming Milestones</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">Adaptive Dates</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-[#FAF5FF] p-2.5 rounded-lg border border-[#F3E8FF]">
                      <span className="text-[#2E1065] font-medium truncate max-w-[200px]">
                        Stage & Lighting Sound Check
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                        Urgent
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB]">
                      <span className="text-[#4B5563] font-medium truncate max-w-[200px]">
                        Dispatch Motion Invites & RSVPs
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0E7FF] text-[#3730A3]">
                        Final Week
                      </span>
                    </div>
                  </div>
                </div>

                {sampleEventId ? (
                  <button
                    onClick={() => onNavigate('workspace', sampleEventId)}
                    className="w-full py-2.5 text-center text-xs sm:text-sm font-bold text-[#2E1065] bg-[#FAF5FF] hover:bg-[#F3E8FF] rounded-xl border border-[#F3E8FF] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Sample Blueprint & Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('create')}
                    className="w-full py-2.5 text-center text-xs sm:text-sm font-bold text-white bg-[#2E1065] hover:bg-[#4C1D95] rounded-xl transition-colors cursor-pointer"
                  >
                    Start Your Plan Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5FF] text-[#5B21B6] border border-[#F3E8FF] mb-3">
            Tailored Intelligence
          </span>
          <h2 className="text-3xl font-serif font-black text-[#2E1065] mb-3">
            Plan Any Celebration, Big or Small
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563]">
            Whether it is an intimate family dinner or a 500-attendee cultural celebration, CelebrAI formulates customized budgets, themes, and agendas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9E2D8] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E1065] mb-2">
              Weddings & Sangeet
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-6 flex-1">
              Multi-ceremony coordination, royal Indian menus, choreographed playlists, and lakeside or banquet venue contracts.
            </p>
            <button
              onClick={() => onNavigate('create', undefined, 'Wedding')}
              className="w-full py-2 text-xs font-bold text-[#2E1065] bg-[#FAF7F2] hover:bg-[#FAF5FF] border border-[#E9E2D8] rounded-lg transition-colors cursor-pointer"
            >
              Plan Wedding →
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9E2D8] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center mb-4">
              <Cake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E1065] mb-2">
              Birthday Milestones
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-6 flex-1">
              From 1st birthday wonderlands to milestone 50th celebrations. Custom cake concepts, fun games, and party emcees.
            </p>
            <button
              onClick={() => onNavigate('create', undefined, 'Birthday')}
              className="w-full py-2 text-xs font-bold text-[#2E1065] bg-[#FAF7F2] hover:bg-[#FAF5FF] border border-[#E9E2D8] rounded-lg transition-colors cursor-pointer"
            >
              Plan Birthday →
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9E2D8] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#FAF5FF] text-[#6D28D9] flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E1065] mb-2">
              Anniversaries
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-6 flex-1">
              Silver, Golden, or intimate anniversaries with nostalgic storytelling, acoustic lounge sets, and candlelit ambiance.
            </p>
            <button
              onClick={() => onNavigate('create', undefined, 'Anniversary')}
              className="w-full py-2 text-xs font-bold text-[#2E1065] bg-[#FAF7F2] hover:bg-[#FAF5FF] border border-[#E9E2D8] rounded-lg transition-colors cursor-pointer"
            >
              Plan Anniversary →
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9E2D8] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E1065] mb-2">
              College Fests & Galas
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-6 flex-1">
              Campus logistics, sound/stage setups, celebrity/band booking buffers, sponsorship tracking, and student crowd management.
            </p>
            <button
              onClick={() => onNavigate('create', undefined, 'College Event')}
              className="w-full py-2 text-xs font-bold text-[#2E1065] bg-[#FAF7F2] hover:bg-[#FAF5FF] border border-[#E9E2D8] rounded-lg transition-colors cursor-pointer"
            >
              Plan College Fest →
            </button>
          </div>
        </div>
      </section>

      {/* Feature Architecture */}
      <section className="bg-white py-14 border-y border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7] mb-3">
              Full-Stack Planning Architecture
            </span>
            <h2 className="text-3xl font-serif font-black text-[#2E1065] mb-3">
              Built for Effortless Execution
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563]">
              Every tool you need to formulate, budget, coordinate, and share your celebration seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF5FF] text-[#2E1065] flex items-center justify-center font-bold">
                <Banknote className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2E1065]">
                Smart INR Budget Engine
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Separate contingency reserve calculations prevent false-budget illusions. Live expense tracking with category utilization metrics.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF5FF] text-[#2E1065] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-[#2E1065]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2E1065]">
                Adaptive Preparation Timelines
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Chronologically phased milestones mapped to actual event dates. Dynamic offset calculations from weeks before down to event day.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF5FF] text-[#2E1065] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#059669]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2E1065]">
                Vendor Strategy & Safeguards
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Customized selection criteria, high-stakes negotiation questions, weather contingency guidelines, and emergency reserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#2E1065] via-[#3B185F] to-[#1C0A35] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white/10 text-[#F59E0B] border border-white/20">
              Ready to Celebrate?
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">
              Begin Blueprinting Your Event in 60 Seconds
            </h2>
            <p className="text-sm sm:text-base text-purple-100 leading-relaxed">
              No guesswork, no spreadsheets. Let CelebrAI craft realistic Indian Rupee budgets, vendor questions, and milestone agendas customized specifically for you.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-[#F59E0B] text-[#1C0A35] hover:bg-[#FBBF24] shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>Create My Event Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
