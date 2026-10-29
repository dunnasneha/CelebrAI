import { GoogleGenAI } from '@google/genai';
import {
  CelebrationEvent,
  BudgetItem,
  GeneratedPlanResult,
  TimelinePhase,
  PriorityLevel
} from '../types';
import { calculateDateOffset } from '../utils/formatters';

function getApiKey(): string {
  // @ts-ignore
  return (import.meta.env?.VITE_GEMINI_API_KEY || '').trim();
}

export function isAIAvailable(): boolean {
  return getApiKey().length > 5;
}

function getGeminiClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.warn('Failed to initialize Google GenAI client:', err);
    return null;
  }
}

function cleanJsonResponse(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();
  }
  if (!(cleaned.startsWith('{') && cleaned.endsWith('}'))) {
    const match = cleaned.match(/(\{[\s\S]*\})/);
    if (match) {
      cleaned = match[1].trim();
    }
  }
  return cleaned;
}

export async function generateEventPlan(eventData: Partial<CelebrationEvent>): Promise<GeneratedPlanResult> {
  const client = getGeminiClient();
  if (client) {
    try {
      const name = eventData.name || 'Celebration';
      const etype = eventData.event_type || 'Celebration';
      const date = eventData.event_date || new Date().toISOString().split('T')[0];
      const location = eventData.location || 'City';
      const guests = eventData.guests || 50;
      const budget = eventData.total_budget || 100000;
      const theme = eventData.theme || 'Classic Elegant';
      const venuePref = eventData.venue_preference || 'Flexible';
      const foodPref = eventData.food_preference || 'Mixed';
      const duration = eventData.duration || '4 hours';
      const specialReqs = eventData.special_requirements || 'None';
      const style = eventData.planning_style || 'Balanced';

      const prompt = `You are CelebrAI, an elite event planner with deep expertise in Indian and global celebrations.
Generate an extraordinary, highly personalized event plan in valid JSON:

EVENT DETAILS:
- Name: ${name}
- Type: ${etype}
- Date: ${date}
- Location: ${location}
- Guests: ${guests}
- Total Budget: INR ₹${budget.toLocaleString('en-IN')}
- Preferred Theme: ${theme}
- Venue Preference: ${venuePref}
- Food Preference: ${foodPref}
- Duration: ${duration}
- Special Requirements: ${specialReqs}
- Planning Style: ${style}

INSTRUCTIONS:
1. Budget allocations must sum approximately to ₹${budget}. All in Indian Rupees (INR) as numeric integers.
2. Include a 'Contingency Reserve' item (5-10% of total budget) with is_contingency: true.
3. In preparation_timeline, provide realistic offset_days (-30 for 30 days before, 0 for event day, 1 for post-event).
4. Return ONLY a single raw JSON object matching this schema:
{
  "overview": {
    "concept": "Unique concept summary",
    "theme": "${theme}",
    "atmosphere": "Atmospheric description",
    "target_audience": "Guest demographic",
    "personalized_description": "2-3 paragraphs describing the celebration",
    "key_considerations": ["Consideration 1", "Consideration 2", "Consideration 3"]
  },
  "budget_breakdown": [
    { "category": "Venue", "allocated_amount": 30000, "notes": "Details", "is_contingency": false },
    { "category": "Catering", "allocated_amount": 35000, "notes": "Details", "is_contingency": false },
    { "category": "Decorations", "allocated_amount": 15000, "notes": "Details", "is_contingency": false },
    { "category": "Photography & Videography", "allocated_amount": 10000, "notes": "Details", "is_contingency": false },
    { "category": "Entertainment", "allocated_amount": 8000, "notes": "Details", "is_contingency": false },
    { "category": "Invitations & Favors", "allocated_amount": 3000, "notes": "Details", "is_contingency": false },
    { "category": "Miscellaneous", "allocated_amount": 4000, "notes": "Details", "is_contingency": false },
    { "category": "Contingency Reserve", "allocated_amount": 5000, "notes": "Safety net", "is_contingency": true }
  ],
  "preparation_timeline": [
    { "title": "Venue Contract", "description": "Lock venue", "phase": "Weeks Before", "offset_days": -30, "priority": "High" },
    { "title": "Menu Tasting", "description": "Select dishes", "phase": "Weeks Before", "offset_days": -20, "priority": "High" },
    { "title": "Send Invites", "description": "Digital invitations", "phase": "Weeks Before", "offset_days": -14, "priority": "Medium" },
    { "title": "Decor Finalization", "description": "Approve theme layout", "phase": "Final Week", "offset_days": -7, "priority": "Medium" },
    { "title": "Vendor Reconfirmation", "description": "Confirm timings", "phase": "Day Before", "offset_days": -1, "priority": "Urgent" },
    { "title": "Event Setup", "description": "Morning setup", "phase": "Event Day", "offset_days": 0, "priority": "Urgent" },
    { "title": "Welcome Guests", "description": "Reception & feast", "phase": "Event Day", "offset_days": 0, "priority": "High" },
    { "title": "Vendor Settlements", "description": "Final payments", "phase": "Post-Event", "offset_days": 1, "priority": "Low" }
  ],
  "vendor_checklist": [
    { "category": "Venue", "criteria": "Space & sound", "questions_to_ask": "Curfew rules?", "estimated_cost": 30000, "deadline_offset_days": -25 },
    { "category": "Catering", "criteria": "Menu & tasting", "questions_to_ask": "Staff provided?", "estimated_cost": 35000, "deadline_offset_days": -20 },
    { "category": "Decorations", "criteria": "Theme aesthetic", "questions_to_ask": "Setup hours?", "estimated_cost": 15000, "deadline_offset_days": -14 },
    { "category": "Photography", "criteria": "Candid reels", "questions_to_ask": "Delivery timeline?", "estimated_cost": 10000, "deadline_offset_days": -14 }
  ],
  "creative_recommendations": {
    "theme_ideas": ["Concept A", "Concept B", "Concept C"],
    "color_palette": [
      { "name": "Royal Purple", "hex": "#2E1065" },
      { "name": "Marigold Gold", "hex": "#F59E0B" },
      { "name": "Rose Blush", "hex": "#FB7185" },
      { "name": "Ivory Cream", "hex": "#FAF7F2" }
    ],
    "decorations": ["Centerpiece idea", "Entrance arch", "Photo wall"],
    "menu_suggestions": {
      "welcome_drinks": ["Drink 1", "Drink 2"],
      "appetizers": ["Starter 1", "Starter 2"],
      "mains": ["Main 1", "Main 2"],
      "desserts": ["Dessert 1", "Dessert 2"]
    },
    "entertainment_ideas": ["Activity 1", "Activity 2"],
    "invitation_draft": "Draft message...",
    "guest_engagement": ["Idea 1", "Idea 2"]
  },
  "risk_management": {
    "weather_contingency": "Canopy or indoor hall backup plan",
    "backup_venue": "Secondary venue contact",
    "emergency_supplies": "First-aid, chargers, safety pins",
    "schedule_delays": "25-min buffer window",
    "budget_overruns": "Keep contingency intact"
  }
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const parsed = JSON.parse(cleanJsonResponse(text));

      // Compute dates
      if (parsed.preparation_timeline) {
        parsed.preparation_timeline.forEach((t: any) => {
          t.due_date = calculateDateOffset(date, t.offset_days || 0);
        });
      }
      if (parsed.vendor_checklist) {
        parsed.vendor_checklist.forEach((v: any) => {
          v.deadline = calculateDateOffset(date, v.deadline_offset_days || -14);
        });
      }

      parsed.is_ai_generated = true;
      parsed.model = 'Gemini 2.5 Flash';
      parsed.mode = 'live';
      return parsed as GeneratedPlanResult;
    } catch (err: any) {
      console.warn('Gemini live call error, falling back to structured generator:', err);
      const fallback = generateDemoPlan(eventData);
      fallback.warning = `Live AI note (${err.message || 'offline'}). Switched to intelligent planner.`;
      return fallback;
    }
  }

  return generateDemoPlan(eventData);
}

export function generateDemoPlan(eventData: Partial<CelebrationEvent>): GeneratedPlanResult {
  const name = eventData.name || 'Celebration';
  const etype = eventData.event_type || 'Celebration';
  const date = eventData.event_date || calculateDateOffset(new Date().toISOString().split('T')[0], 30);
  const location = eventData.location || 'Mumbai, India';
  const guests = Number(eventData.guests) || 75;
  const budget = Number(eventData.total_budget) || 150000;
  const theme = eventData.theme || 'Regal Elegance';
  const venuePref = eventData.venue_preference || 'Flexible';
  const foodPref = eventData.food_preference || 'Mixed';
  const duration = eventData.duration || '4-5 hours';
  const style = eventData.planning_style || 'Balanced';

  let vPct = 0.28, cPct = 0.30, dPct = 0.14, pPct = 0.09, ePct = 0.06, iPct = 0.03, mPct = 0.03, contPct = 0.07;
  const lowerEtype = etype.toLowerCase();

  if (lowerEtype.includes('wedding')) {
    vPct = 0.30; cPct = 0.28; dPct = 0.14; pPct = 0.10; ePct = 0.06; iPct = 0.03; mPct = 0.03; contPct = 0.06;
  } else if (lowerEtype.includes('birthday')) {
    vPct = 0.22; cPct = 0.35; dPct = 0.16; pPct = 0.08; ePct = 0.08; iPct = 0.02; mPct = 0.03; contPct = 0.06;
  } else if (lowerEtype.includes('college')) {
    vPct = 0.20; cPct = 0.25; dPct = 0.15; pPct = 0.08; ePct = 0.15; iPct = 0.04; mPct = 0.05; contPct = 0.08;
  }

  const venueAmt = Math.round(budget * vPct);
  const caterAmt = Math.round(budget * cPct);
  const decorAmt = Math.round(budget * dPct);
  const photoAmt = Math.round(budget * pPct);
  const entAmt = Math.round(budget * ePct);
  const invAmt = Math.round(budget * iPct);
  const contAmt = Math.round(budget * contPct);
  const miscAmt = Math.max(0, budget - (venueAmt + caterAmt + decorAmt + photoAmt + entAmt + invAmt + contAmt));

  return {
    is_ai_generated: false,
    mode: 'demo',
    notice: 'Demo Mode: Pre-structured Template (Configure VITE_GEMINI_API_KEY in .env for live GenAI generation).',
    overview: {
      concept: `A breathtaking ${style.toLowerCase()} celebration centered on '${theme}', seamlessly blending warmth, style, and hospitality.`,
      theme,
      atmosphere: `Warm, celebratory, and intimately vibrant, designed to delight ${guests} cherished guests in ${location}.`,
      target_audience: `Friends, family, and colleagues coming together for a memorable ${etype.toLowerCase()}.`,
      personalized_description: `${name} is crafted to be an unforgettable milestone celebration. Held in ${location} with ${guests} attendees, every element from the ${venuePref.toLowerCase()} ambiance to the ${foodPref.toLowerCase()} banquet is curated to ensure effortless enjoyment and timeless memories.`,
      key_considerations: [
        `Optimal per-guest budget allocation of approximately ₹${Math.round(budget / Math.max(1, guests)).toLocaleString('en-IN')}`,
        `Comfortable arrangement for ${venuePref} venue with adequate seasonal ventilation`,
        `Specially curated ${foodPref} food menu with live serving stations`
      ]
    },
    budget_breakdown: [
      { category: 'Venue', allocated_amount: venueAmt, notes: `Space rental for ${duration} with basic facilities`, is_contingency: false },
      { category: 'Catering', allocated_amount: caterAmt, notes: `Full ${foodPref} buffet for ${guests} guests with welcome drinks`, is_contingency: false },
      { category: 'Decorations', allocated_amount: decorAmt, notes: `Themed entrance arch, stage backdrop, and table florals in ${theme} style`, is_contingency: false },
      { category: 'Photography & Videography', allocated_amount: photoAmt, notes: 'Candid photographer, edited highlight reel, and digital album', is_contingency: false },
      { category: 'Entertainment', allocated_amount: entAmt, notes: 'DJ sound console, dynamic lighting, and celebration emcee', is_contingency: false },
      { category: 'Invitations & Favors', allocated_amount: invAmt, notes: 'Custom digital motion invitations and themed return gift boxes', is_contingency: false },
      { category: 'Miscellaneous', allocated_amount: miscAmt, notes: 'Local transport, cake/treats, service gratuities, and emergency extras', is_contingency: false },
      { category: 'Contingency Reserve', allocated_amount: contAmt, notes: 'Dedicated 6-8% safety buffer for unplanned expenses', is_contingency: true }
    ],
    preparation_timeline: [
      {
        title: `Select and Book ${venuePref} Venue`,
        description: `Inspect venues in ${location} capable of seating ${guests} guests with adequate parking.`,
        phase: 'Weeks Before',
        due_date: calculateDateOffset(date, -30),
        priority: 'High'
      },
      {
        title: `Finalize ${foodPref} Catering Menu`,
        description: 'Lock in plate counts, starter selections, live counters, and dietary alternatives.',
        phase: 'Weeks Before',
        due_date: calculateDateOffset(date, -20),
        priority: 'High'
      },
      {
        title: 'Send Digital Invitations & Collect RSVPs',
        description: 'Dispatch WhatsApp motion invites and keep an updated attendee head-count.',
        phase: 'Weeks Before',
        due_date: calculateDateOffset(date, -14),
        priority: 'Medium'
      },
      {
        title: `Approve '${theme}' Decor & Floral Layout`,
        description: 'Sign off on photobooth design, welcome board, and stage lighting with decorator.',
        phase: 'Final Week',
        due_date: calculateDateOffset(date, -7),
        priority: 'Medium'
      },
      {
        title: 'Vendor Reconfirmation Call',
        description: 'Confirm setup timings with venue manager, caterer, photographer, and sound technician.',
        phase: 'Day Before',
        due_date: calculateDateOffset(date, -1),
        priority: 'Urgent'
      },
      {
        title: 'Morning Venue Setup & Sound Check',
        description: 'Inspect stage setup, test microphones, inspect floral freshness, and verify power backup.',
        phase: 'Event Day',
        due_date: calculateDateOffset(date, 0),
        priority: 'Urgent'
      },
      {
        title: 'Welcome Guests & Opening Ceremony',
        description: 'Serve welcome mocktails, inaugurate celebration, and kick off scheduled activities.',
        phase: 'Event Day',
        due_date: calculateDateOffset(date, 0),
        priority: 'High'
      },
      {
        title: 'Dinner Buffet & Celebration Moments',
        description: 'Open buffet dinner, capture group photographs, and run entertainment segments.',
        phase: 'Event Day',
        due_date: calculateDateOffset(date, 0),
        priority: 'Medium'
      },
      {
        title: 'Vendor Settlements & Return Gifts',
        description: 'Hand over return gifts to departing guests and settle vendor balances.',
        phase: 'Post-Event',
        due_date: calculateDateOffset(date, 1),
        priority: 'Low'
      }
    ],
    vendor_checklist: [
      {
        category: 'Venue',
        criteria: `Clean aesthetic, capacity for ${guests} guests, ${venuePref} preference, generator backup`,
        questions_to_ask: 'What are the sound limit curfews? Are outside decor vendors permitted with no extra surcharge?',
        estimated_cost: venueAmt,
        deadline: calculateDateOffset(date, -25)
      },
      {
        category: 'Catering',
        criteria: `Verified reviews, fresh ${foodPref} specialties, uniformed serving staff`,
        questions_to_ask: 'Can you provide live tasting sessions? What is the cut-off date for final headcount adjustment?',
        estimated_cost: caterAmt,
        deadline: calculateDateOffset(date, -20)
      },
      {
        category: 'Decorations',
        criteria: `Specialized in '${theme}' visual themes, fairy-lighting, fresh floral styling`,
        questions_to_ask: 'How many hours before the event does your team begin installation?',
        estimated_cost: decorAmt,
        deadline: calculateDateOffset(date, -15)
      },
      {
        category: 'Photography',
        criteria: 'Artistic candid captures, dynamic reels, rapid 7-day highlight turnaround',
        questions_to_ask: 'Will you provide uncompressed high-resolution digital copies of all photos?',
        estimated_cost: photoAmt,
        deadline: calculateDateOffset(date, -14)
      },
      {
        category: 'Entertainment',
        criteria: 'High-energy playlist curation, reliable sound equipment, versatile emcee',
        questions_to_ask: 'Do you accept custom guest song requests and interactive party games?',
        estimated_cost: entAmt,
        deadline: calculateDateOffset(date, -10)
      }
    ],
    creative_recommendations: {
      theme_ideas: [
        `${theme} — Subtle luxury with velvet textures, gold metallic accents, and warm ambient lighting`,
        'Royal Twilight — Deep jewel tones of amethyst and champagne with whimsical fairy light curtains',
        'Botanical Serenity — Fresh eucalyptus leaves, blush florals, and natural wood accents'
      ],
      color_palette: [
        { name: 'Deep Royal Purple', hex: '#2E1065' },
        { name: 'Soft Rose', hex: '#FB7185' },
        { name: 'Warm Cream', hex: '#FAF7F2' },
        { name: 'Champagne Gold', hex: '#F59E0B' }
      ],
      decorations: [
        'Custom geometric welcome arch draped in sheer organza and warm fairy lights',
        `Personalized '${name}' photo-wall with gold neon script and cascading floral garlands`,
        'Tables styled with warm cream runners, brass candelabras, and handwritten name cards'
      ],
      menu_suggestions: {
        welcome_drinks: ['Sparkling Hibiscus Mojito', 'Chilled Saffron Almond Thandai', 'Fresh Mint Lime Cooler'],
        appetizers: ['Crispy Amritsari Paneer Bites / Chicken Kebabs', 'Truffle Cheese Poppers', 'Lotus Stem Crisps'],
        mains: ['Signature Dal Makhani slow-cooked 18 hours', 'Paneer Pasanda / Butter Chicken', 'Fragrant Awadhi Dum Biryani with Burani Raita', 'Assorted Butter Naan & Kulchas'],
        desserts: ['Saffron Phirni in earthen pots', 'Sizzling Walnut Brownie with Vanilla Bean Gelato', 'Fresh Fruit Skewers']
      },
      entertainment_ideas: [
        'Curated Spotify DJ set transitioning from lounge acoustic vibes to upbeat dance anthems',
        `Personalized ${etype} Trivia Challenge with customized prizes for the winning table`,
        'Instant Polaroid Guestbook station where guests snap photos and tape them with handwritten notes'
      ],
      invitation_draft: `You make our world brighter! Please join us as we celebrate ${name} on ${date} at ${location}. An evening of laughter, exquisite feasting, and cherished moments awaits your arrival.`,
      guest_engagement: [
        'QR code on every table linking to a shared live Google Photos album',
        'Signature drink named after the host/guest of honor',
        'Heartfelt memory box where guests drop handwritten wishes'
      ]
    },
    risk_management: {
      weather_contingency: `Ensure ${venuePref} venue has an immediate covered banquet section or weatherproof canopy in case of rain or high heat.`,
      backup_venue: 'Maintain confirmed contacts for two alternative nearby spaces with refundable advance policies.',
      emergency_supplies: 'Equip the host lounge with a celebration emergency kit: lint rollers, safety pins, phone chargers, pain relievers, and umbrellas.',
      schedule_delays: 'Add a 25-minute grace period between the scheduled invitation arrival time and main cake-cutting/ceremony.',
      budget_overruns: `Keep the ₹${contAmt.toLocaleString('en-IN')} contingency intact; do not commit extra custom add-ons within 72 hours of the event.`
    }
  };
}

export async function improveTheme(event: Partial<CelebrationEvent>, currentTheme: string = ''): Promise<{
  themes: {
    name: string;
    tagline: string;
    description: string;
    colors: { name: string; hex: string }[];
    decor_highlights: string[];
    music_vibe: string;
  }[];
}> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Suggest 3 fresh, creative, and distinct theme concepts for a ${event.event_type || 'Celebration'} (${event.planning_style || 'Balanced'} style, current theme: '${currentTheme || event.theme || ''}').
Return ONLY a valid JSON object matching this structure:
{
  "themes": [
    {
      "name": "Theme Name",
      "tagline": "Catchy one-sentence vibe",
      "description": "2-sentence concept description",
      "colors": [
        { "name": "Color 1", "hex": "#123456" },
        { "name": "Color 2", "hex": "#abcdef" },
        { "name": "Color 3", "hex": "#fedcba" }
      ],
      "decor_highlights": ["Point 1", "Point 2"],
      "music_vibe": "Music description"
    }
  ]
}`;
      const res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return JSON.parse(cleanJsonResponse(res.text || ''));
    } catch (e) {
      console.warn('Gemini theme suggestion failed, using curated templates:', e);
    }
  }

  return {
    themes: [
      {
        name: 'Enchanted Starlit Soirée',
        tagline: 'Whimsical twilight elegance bathed in soft glowing amber',
        description: 'Transform the space into an ethereal evening glade with cascading fairy lights, midnight blue drapery, and brass lanterns.',
        colors: [
          { name: 'Midnight Indigo', hex: '#1E1B4B' },
          { name: 'Champagne Gold', hex: '#F59E0B' },
          { name: 'Warm Cream', hex: '#FAF7F2' }
        ],
        decor_highlights: ['Ceiling of fairy light canopies', 'Low floral centerpieces with scented pillar candles'],
        music_vibe: 'Chilled acoustic covers and soulful saxophone lounge'
      },
      {
        name: 'Royal Moroccan Sunset',
        tagline: 'Warm terracotta warmth, bohemian lanterns, and rich spice tones',
        description: 'An intimate, vibrant celebration featuring patterned floor cushions, low brass tables, and fragrant botanical flourishes.',
        colors: [
          { name: 'Terracotta Rose', hex: '#BE185D' },
          { name: 'Saffron Spice', hex: '#D97706' },
          { name: 'Deep Plum', hex: '#4C1D95' }
        ],
        decor_highlights: ['Intricate brass cut lanterns casting shadow art', 'Plush velvet lounge seating area'],
        music_vibe: 'Upbeat Mediterranean chillhop and lively world beats'
      },
      {
        name: 'Minimalist Garden Chic',
        tagline: 'Clean modern lines, lush eucalyptus, and fresh organic elegance',
        description: 'An understated luxury aesthetic prioritizing natural greenery, warm wood elements, and crystal glass accents.',
        colors: [
          { name: 'Forest Green', hex: '#065F46' },
          { name: 'Blush Petal', hex: '#FBCFE8' },
          { name: 'Ivory Alabaster', hex: '#FFFBEB' }
        ],
        decor_highlights: ['Suspended eucalyptus foliage chandeliers', 'Personalized wooden calligraphy placecards'],
        music_vibe: 'Bossa nova, lo-fi beats, and modern acoustic pop'
      }
    ]
  };
}

export async function optimizeBudget(event: Partial<CelebrationEvent>, items: BudgetItem[]): Promise<{
  analysis: string;
  tips: {
    title: string;
    category: string;
    potential_saving: string;
    action: string;
  }[];
}> {
  const budget = Number(event.total_budget) || 100000;
  const client = getGeminiClient();
  if (client) {
    try {
      const itemsStr = JSON.stringify(items.map(i => ({ category: i.category, amount: i.allocated_amount })));
      const prompt = `You are a senior event financial strategist. Analyze this event budget of INR ₹${budget.toLocaleString('en-IN')} with items:
${itemsStr}
Provide 4 practical, specific cost-saving opportunities without compromising guest experience.
Return ONLY valid JSON:
{
  "analysis": "Summary of budget health",
  "tips": [
    {
      "title": "Strategy title",
      "category": "Impacted category",
      "potential_saving": "Estimated ₹ saving range",
      "action": "Concrete action"
    }
  ]
}`;
      const res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return JSON.parse(cleanJsonResponse(res.text || ''));
    } catch (e) {
      console.warn('Gemini optimize budget failed, using financial rules:', e);
    }
  }

  return {
    analysis: `Your current budget of ₹${budget.toLocaleString('en-IN')} has strong foundational allocations. By optimizing catering formats and decor sourcing, you can unlock 12-18% in strategic savings.`,
    tips: [
      {
        title: 'Adopt Hybrid Grazing & Live Counters',
        category: 'Catering',
        potential_saving: `₹${Math.round(budget * 0.05).toLocaleString('en-IN')}`,
        action: 'Instead of an oversized 24-item static buffet, feature 3 premium live counters and a curated 8-dish seasonal menu to eliminate food waste.'
      },
      {
        title: 'Reusable & Statement Decor Focus',
        category: 'Decorations',
        potential_saving: `₹${Math.round(budget * 0.04).toLocaleString('en-IN')}`,
        action: 'Invest heavily in one "showstopper" photo backdrop and use warm ambient uplighting rather than spreading flowers thinly across all walls.'
      },
      {
        title: 'Digital First & Motion Invites',
        category: 'Invitations',
        potential_saving: `₹${Math.round(budget * 0.02).toLocaleString('en-IN')}`,
        action: 'Replace expensive physical boxed stationery with interactive WhatsApp web invitations and digital RSVP forms.'
      },
      {
        title: 'Package Photography with Videography',
        category: 'Photography',
        potential_saving: `₹${Math.round(budget * 0.03).toLocaleString('en-IN')}`,
        action: 'Negotiate a combined dual-shooter package with a single studio instead of booking solo photographers and videographers separately.'
      }
    ]
  };
}

export async function generateInvitation(event: Partial<CelebrationEvent>): Promise<{
  formal: string;
  casual: string;
  poetic: string;
  whatsapp: string;
}> {
  const name = event.name || 'Special Celebration';
  const etype = event.event_type || 'Celebration';
  const date = event.event_date || 'Upcoming Date';
  const loc = event.location || 'Venue';
  const theme = event.theme || 'Celebration';

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Write 4 distinct invitation copy versions for:
- Event: ${name} (${etype})
- Date: ${date}
- Location: ${loc}
- Theme: ${theme}

Generate:
1. Formal (Traditional, dignified)
2. Casual (Warm, friendly)
3. Poetic (Emotional, elegant)
4. WhatsApp (Emoji-rich, bullet points, RSVP format)

Return ONLY valid JSON:
{
  "formal": "text",
  "casual": "text",
  "poetic": "text",
  "whatsapp": "text"
}`;
      const res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return JSON.parse(cleanJsonResponse(res.text || ''));
    } catch (e) {
      console.warn('Gemini generate invitations failed, using templates:', e);
    }
  }

  return {
    formal: `We request the pleasure of your company at the celebration of ${name}.\n\nDate: ${date}\nVenue: ${loc}\nTheme: ${theme}\n\nYour gracious presence will add warmth and joy to this auspicious occasion. Kindly RSVP at your earliest convenience.`,
    casual: `Good times are better when shared with friends! 🎉\n\nCome celebrate ${name} with us on ${date} at ${loc}.\nExpect great food, fabulous drinks, wonderful music, and unforgettable memories.\n\nWe can't wait to see you there!`,
    poetic: `Moments pass, but beautiful memories linger forever.\n\nAs we celebrate the joy of ${name}, we invite you to be part of our story on ${date} at ${loc}.\nUnder a canopy of laughter and starlight, your presence will be our greatest gift.`,
    whatsapp: `✨ *YOU ARE CORDIALLY INVITED!* ✨\n\n🎈 *Event:* ${name} (${etype})\n📅 *Date:* ${date}\n📍 *Venue:* ${loc}\n🎨 *Theme:* ${theme}\n\n🥂 *Highlights:* Exquisite dinner, live entertainment & joyous moments!\n📲 *Please RSVP by clicking here:* [RSVP Link]\nLooking forward to celebrating with you! ❤️`
  };
}

export async function suggestActivities(event: Partial<CelebrationEvent>): Promise<{
  activities: {
    title: string;
    duration: string;
    best_time: string;
    how_it_works: string;
    supplies_needed: string[];
  }[];
}> {
  const etype = event.event_type || 'Celebration';
  const guests = event.guests || 50;

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Suggest 5 engaging, modern party activities and games for a ${etype} with approximately ${guests} guests.
Return ONLY valid JSON:
{
  "activities": [
    {
      "title": "Activity Name",
      "duration": "15-20 mins",
      "best_time": "Cocktail hour / After dessert",
      "how_it_works": "Step-by-step description",
      "supplies_needed": ["Item 1", "Item 2"]
    }
  ]
}`;
      const res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return JSON.parse(cleanJsonResponse(res.text || ''));
    } catch (e) {
      console.warn('Gemini activities failed, using curated activity bank:', e);
    }
  }

  return {
    activities: [
      {
        title: 'The Memory Capsule & Polaroid Wall',
        duration: 'Ongoing throughout event',
        best_time: 'Guest Arrival / Welcome Drinks',
        how_it_works: 'Guests snap instant photos with customized props, write their warmest memory or blessing on the photo border, and peg it onto a fairy-lit twine board.',
        supplies_needed: ['2 Fuji Instax or Polaroid cameras', 'Extra film packs', 'Metallic Sharpies', 'Twine board with mini wooden clips']
      },
      {
        title: 'Personalized Trivia Showdown',
        duration: '20-25 mins',
        best_time: 'Mid-celebration right before dinner',
        how_it_works: 'An interactive 8-question game hosted by the emcee or a friend using smartphone buzzers or card paddles, centered on fun facts about the hosts or honoree.',
        supplies_needed: ['Projector or microphone', 'Kahoot PIN or printed voting paddles', 'Small gift hamper for winner']
      },
      {
        title: "Musical 'Through the Decades' Groove",
        duration: '30 mins',
        best_time: 'Post-dinner dance transition',
        how_it_works: 'The DJ drops iconic anthems starting from the 80s/90s up through current chart-toppers, challenging each table to take over the dance floor during their era.',
        supplies_needed: ['Sound system / DJ console', 'Glow sticks or party sunglasses']
      },
      {
        title: 'Signature Toast Challenge',
        duration: '15 mins',
        best_time: 'Dinner kickoff',
        how_it_works: 'Guests are served the signature celebration drink. Selected close friends and family deliver 60-second rapid-fire toasts celebrating love, friendship, or milestone achievements.',
        supplies_needed: ['Signature welcome beverages', 'Wireless microphone']
      },
      {
        title: 'The Golden Envelope Surprise',
        duration: '10 mins',
        best_time: 'Cake cutting / Finale',
        how_it_works: 'One secret envelope is taped beneath one chair at each dining table. At a designated cue, guests check under their seats. The lucky holders win a special curated takeaway favor.',
        supplies_needed: ['Golden envelopes with congratulation notes', 'Curated artisanal favor boxes']
      }
    ]
  };
}

export async function askCelebrAI(
  event: Partial<CelebrationEvent>,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ reply: string; is_ai: boolean }> {
  const name = event.name || 'Celebration';
  const etype = event.event_type || 'Celebration';
  const date = event.event_date || '';
  const loc = event.location || '';
  const budget = Number(event.total_budget) || 0;
  const guests = event.guests || 0;

  const client = getGeminiClient();
  if (client) {
    try {
      let historyText = '';
      for (const item of history.slice(-6)) {
        historyText += `${item.role.toUpperCase()}: ${item.content}\n`;
      }

      const prompt = `You are CelebrAI, an expert, enthusiastic, and sophisticated AI event concierge.
You are helping the user plan their event with these details:
- Event: ${name} (${etype})
- Date: ${date}
- Location: ${loc}
- Budget: INR ₹${budget.toLocaleString('en-IN')}
- Guests: ${guests}

CONVERSATION HISTORY:
${historyText}

USER'S CURRENT QUESTION:
${userMessage}

Provide a thoughtful, practical, and highly creative response in clear markdown format.
Keep recommendations realistic for their budget and location.
Offer proactive follow-up suggestions where helpful.`;

      const res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return { reply: (res.text || '').trim(), is_ai: true };
    } catch (e) {
      console.warn('Gemini chat failed, using expert concierge fallback:', e);
    }
  }

  const reply = `Thank you for asking about **${name}**! For a ${etype.toLowerCase()} with ${guests} guests in ${loc} on a budget of ₹${budget.toLocaleString('en-IN')}, here is my expert recommendation:

1. **Timing & Logistics:** Ensure vendors arrive at least 3 hours prior to guest arrival. Stagger deliveries to prevent parking bottlenecks in ${loc}.
2. **Budget Safety:** Maintain at least ₹${Math.round(budget * 0.06).toLocaleString('en-IN')} as your contingency buffer to absorb last-minute plate additions or overtime hours.
3. **Guest Experience:** Direct 70% of guest focus towards outstanding food freshness, welcoming music, and comfortable seating. Guests remember heartfelt hospitality far longer than extravagant table linens!

*(Tip: You can customize your timeline tasks and vendor checklist directly from the tabs above!)*`;

  return { reply, is_ai: false };
}

export const AIService = {
  isAIAvailable,
  generateEventPlan,
  generateInvitation,
  generateInvitations: (name: string, event_type?: string, date?: string, location?: string, theme?: string) => {
    return generateInvitation({ name, event_type, event_date: date, location, theme });
  },
  improveTheme,
  generateThemeSuggestions: improveTheme,
  optimizeBudget,
  suggestActivities,
  generateActivitySuggestions: suggestActivities,
  askCelebrAI,
  askConcierge: (userMessage: string, eventName?: string, budget?: number | string) => {
    return askCelebrAI({ name: eventName || 'Celebration', total_budget: Number(budget) || 100000 }, userMessage);
  }
};

export const aiService = AIService;



