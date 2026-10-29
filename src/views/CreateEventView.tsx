import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Banknote, 
  Palette, 
  Utensils, 
  Building, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CelebrationEvent } from '../types';
import { formatINR, calculateDateOffset } from '../utils/formatters';
import { generateEventPlan } from '../services/aiService';
import { StorageService } from '../services/storageService';

interface CreateEventViewProps {
  initialEventType?: string;
  onCancel: () => void;
  onSuccess: (eventId: string) => void;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({ 
  initialEventType = 'Wedding',
  onCancel, 
  onSuccess 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultFutureDate = calculateDateOffset(todayStr, 30);

  const [formData, setFormData] = useState({
    name: '',
    event_type: initialEventType,
    event_date: defaultFutureDate,
    location: '',
    guests: 75,
    total_budget: 250000,
    theme: initialEventType === 'Birthday' ? 'Confetti Celebration' : initialEventType === 'Anniversary' ? 'Golden Nostalgia' : initialEventType === 'College Event' ? 'Neon Pulse Fest' : 'Regal Elegance',
    venue_preference: 'Outdoor',
    food_preference: 'Mixed',
    duration: '4-5 hours',
    special_requirements: '',
    planning_style: 'Balanced'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const budgetPresets = [
    { label: '₹50,000', value: 50000 },
    { label: '₹1,00,000', value: 100000 },
    { label: '₹2,50,000', value: 250000 },
    { label: '₹5,00,000', value: 500000 },
    { label: '₹10,00,000', value: 1000000 },
    { label: '₹25,00,000', value: 2500000 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter an event name.');
      return;
    }
    if (!formData.event_date) {
      setErrorMessage('Please select the celebration date.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the location or city.');
      return;
    }
    if (formData.guests <= 0) {
      setErrorMessage('Guest count must be at least 1.');
      return;
    }
    if (formData.total_budget <= 0) {
      setErrorMessage('Please enter a valid budget in INR.');
      return;
    }

    setIsLoading(true);

    const steps = [
      'Analyzing guest demographics & location logistics...',
      'Formulating realistic INR category allocations with contingency guard...',
      'Sequencing chronological milestones based on event date...',
      'Compiling vendor selection criteria & negotiation questions...',
      'Synthesizing creative blueprint & finalized executive plan...'
    ];

    let stepIdx = 0;
    setCurrentStepText(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setCurrentStepText(steps[stepIdx]);
      }
    }, 900);

    try {
      const planResult = await generateEventPlan(formData);
      const newEventId = StorageService.saveGeneratedPlan(formData, planResult);
      clearInterval(interval);
      onSuccess(newEventId);
    } catch (err: any) {
      clearInterval(interval);
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to generate event plan. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4B5563] hover:text-[#2E1065] cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-bold text-[#B45309] bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FEF3C7]">
          AI Plan Wizard
        </span>
      </div>

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-serif font-black text-[#2E1065]">
          Create Your Celebration Blueprint
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Specify your celebration vision, and CelebrAI will assemble custom INR allocations, chronological milestone schedules, and vendor interview checklists in seconds.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-4 text-[#991B1B] text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-xs space-y-8">
        {/* Section 1: Core Details */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2E1065] border-b border-[#E9E2D8] pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>1. Essential Celebration Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Event Name <span className="text-[#E11D48]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav & Diya's Royal Sangeet, Meera's 30th Gala"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Event Type <span className="text-[#E11D48]">*</span>
              </label>
              <select
                value={formData.event_type}
                onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Wedding">Wedding / Sangeet / Reception</option>
                <option value="Birthday">Birthday Milestone</option>
                <option value="Anniversary">Anniversary Celebration</option>
                <option value="College Event">College Fest / Campus Gala</option>
                <option value="Corporate">Corporate Gathering / Retreat</option>
                <option value="Festival">Festival Celebration</option>
                <option value="Other">Custom Celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Event Date <span className="text-[#E11D48]">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={formData.event_date}
                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Location or City <span className="text-[#E11D48]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Udaipur, Bandra (Mumbai), Bengaluru"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Estimated Guest Count <span className="text-[#E11D48]">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={formData.guests === 0 ? '' : formData.guests}
                onChange={e => setFormData({ ...formData, guests: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) })}
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Budget in INR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E2D8] pb-2">
            <h3 className="font-serif text-lg font-bold text-[#2E1065] flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#059669]" />
              <span>2. Total Target Budget (INR)</span>
            </h3>
            <span className="text-sm font-extrabold text-[#059669]">
              {formatINR(formData.total_budget)}
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="number"
              min="5000"
              step="5000"
              value={formData.total_budget === 0 ? '' : formData.total_budget}
              onChange={e => setFormData({ ...formData, total_budget: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
              required
              className="w-full px-4 py-3 text-base sm:text-lg font-bold bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED] text-[#2E1065]"
            />

            {/* Quick preset chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#6B7280]">Quick Select:</span>
              {budgetPresets.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, total_budget: preset.value })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    formData.total_budget === preset.value
                      ? 'bg-[#2E1065] text-white'
                      : 'bg-[#FAF7F2] text-[#4B5563] hover:text-[#2E1065] border border-[#E9E2D8]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#6B7280]">
              * CelebrAI automatically provisions a dedicated 5–10% contingency reserve to prevent overruns.
            </p>
          </div>
        </div>

        {/* Section 3: Creative & Venue Preferences */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2E1065] border-b border-[#E9E2D8] pb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#6D28D9]" />
            <span>3. Atmosphere, Cuisine & Logistics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Preferred Theme / Aesthetic
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Marigold & Amethyst, Bohemian Sunset"
                value={formData.theme}
                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Venue Preference
              </label>
              <select
                value={formData.venue_preference}
                onChange={e => setFormData({ ...formData, venue_preference: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Outdoor">Outdoor Lawn / Lakeside Courtyard</option>
                <option value="Indoor">Indoor Heritage Banquet / AC Hall</option>
                <option value="Terrace">Terrace / Rooftop Garden</option>
                <option value="Banquet">Dedicated Hotel Banquet</option>
                <option value="Flexible">Flexible / Undecided</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Catering Preference
              </label>
              <select
                value={formData.food_preference}
                onChange={e => setFormData({ ...formData, food_preference: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Mixed">Mixed (Vegetarian & Non-Vegetarian)</option>
                <option value="Vegetarian">Pure Vegetarian Feast</option>
                <option value="Jain">Jain Friendly Available</option>
                <option value="Vegan">Vegan & Healthy Gourmet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Event Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 4-5 hours, Full Day, 2 Days"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Planning Style
              </label>
              <select
                value={formData.planning_style}
                onChange={e => setFormData({ ...formData, planning_style: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Balanced">Balanced (Optimal Value & Ambiance)</option>
                <option value="Budget-Friendly">Budget-Friendly (Smart Maximization)</option>
                <option value="Premium">Premium (Statement Decor & Candid Reels)</option>
                <option value="Luxury">Royal Luxury (Opulent Grandeur)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2E1065] mb-1">
                Special Requirements or Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Need acoustic live music stage, separate chaat counter, elderly guest accessibility, valet parking..."
                value={formData.special_requirements}
                onChange={e => setFormData({ ...formData, special_requirements: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E9E2D8] rounded-xl focus:bg-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B7280]">
            ⚡ Generates instant realistic breakdown, adaptive schedule & vendor checklist
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
                <span>Crafting Celebration Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Formulate Event Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E9E2D8] shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E1065] to-[#7C3AED] flex items-center justify-center text-[#F59E0B] mx-auto shadow-lg shadow-purple-950/20">
              <Sparkles className="w-8 h-8 animate-pulse fill-current" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-black text-[#2E1065]">
                CelebrAI is Planning
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#7C3AED] min-h-[40px] flex items-center justify-center">
                {currentStepText}
              </p>
            </div>

            <div className="w-full bg-[#FAF7F2] rounded-full h-2 border border-[#E9E2D8] overflow-hidden">
              <div className="bg-gradient-to-r from-[#F59E0B] via-[#E11D48] to-[#7C3AED] h-full rounded-full animate-pulse w-full" />
            </div>

            <div className="text-[11px] text-[#6B7280]">
              Synthesizing budget formulas in INR & adaptive milestone calendars...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
