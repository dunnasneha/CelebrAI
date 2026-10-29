import {
  CelebrationEvent,
  BudgetItem,
  TimelineTask,
  Vendor,
  BudgetSummary,
  DashboardMetrics,
  GeneratedPlanResult
} from '../types';
import { formatINR, calculateDateOffset } from '../utils/formatters';

const STORAGE_KEYS = {
  EVENTS: 'celebr_ai_events',
  BUDGET_ITEMS: 'celebr_ai_budget_items',
  TASKS: 'celebr_ai_timeline_tasks',
  VENDORS: 'celebr_ai_vendors'
};

function getSampleDate(offsetDays: number = 45): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function initSampleData() {
  const existing = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (existing) return;

  const sampleDate = getSampleDate(45);
  const sampleEventId = 'sample-event-1';

  const sampleEvent: CelebrationEvent = {
    id: sampleEventId,
    name: "Aarav & Diya's Royal Sangeet",
    event_type: 'Wedding',
    event_date: sampleDate,
    location: 'Udaipur, Rajasthan',
    guests: 120,
    total_budget: 500000,
    theme: 'Regal Marigold & Twilight Amethyst',
    venue_preference: 'Outdoor',
    food_preference: 'Mixed',
    duration: '6 hours',
    special_requirements: 'Outdoor lakeside courtyard with acoustic stage setup and live dessert counter',
    planning_style: 'Premium',
    status: 'Planning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    overview: {
      concept: 'A grand heritage Sangeet celebration fusing classic Rajasthani elegance with contemporary celebration music.',
      theme: 'Regal Marigold & Twilight Amethyst',
      atmosphere: 'Opulent, festive, and warm with lakeside reflections and candlelit pathways.',
      target_audience: 'Families, friends, and wedding guests enjoying musical performances.',
      personalized_description: 'An unforgettable evening overlooking Lake Pichola, featuring dynamic dance performances, live acoustic folk singers, and an indulgent royal Rajasthani banquet.',
      key_considerations: [
        'Outdoor acoustic permit until 10:00 PM; late-night transition to indoor heritage lounge',
        'Dedicated weather-safe sheer canopies along the lakeside courtyard',
        'Live artisanal chaat counter and traditional Ghewar dessert display'
      ]
    },
    creative: {
      theme_ideas: [
        'Regal Marigold & Twilight Amethyst',
        'Emerald Oasis & Brass Antiques',
        'Jodhpur Indigo & Starlight Glass'
      ],
      color_palette: [
        { name: 'Deep Amethyst Purple', hex: '#2E1065' },
        { name: 'Warm Marigold Gold', hex: '#F59E0B' },
        { name: 'Soft Rose', hex: '#FB7185' },
        { name: 'Ivory Cream', hex: '#FAF7F2' }
      ],
      decorations: [
        'Brass urlis filled with fresh marigold petals and floating diya candles',
        'Fairy-lit velvet drapes framing the elevated wooden dance stage',
        'Lakeside illuminated photo wall with custom couple monogram'
      ],
      menu_suggestions: {
        welcome_drinks: ['Saffron Almond Thandai', 'Fresh Pomegranate Cardamom Spritzer'],
        appetizers: ['Dahi Kebab with Mint Chutney', 'Murgh Malai Tikka Skewers', 'Crispy Lotus Root Bites'],
        mains: ['Dal Baati Churma Royal Thali', 'Slow-cooked Mutton Laal Maas', 'Paneer Kundan Kalia', 'Garlic Butter Naan'],
        desserts: ['Warm Malpua with Rabdi', 'Smoked Jalebi Caviar with Pistachio Kulfi']
      },
      entertainment_ideas: [
        'Choreographed family dance face-off',
        'Live traditional Manganiyar folk ensemble to welcome guests',
        'Retro Bollywood DJ session with customized dhol players'
      ],
      invitation_draft: 'Together with our families, we invite you to an evening of music, dance, and celebration as Aarav & Diya celebrate their Sangeet on the shores of Lake Pichola.',
      guest_engagement: [
        'Bangles and customized potli favor giveaway station for ladies',
        'Turban-tying and safa stylist booth for gentleman guests',
        'Polaroid memories corner with vintage brass photo frames'
      ]
    },
    risk: {
      weather_contingency: 'Reserved adjacent indoor Durbar Hall in case of unexpected evening rain or high lakeside winds.',
      backup_venue: 'Indoor banquet on same property reserved with no extra transfer fee.',
      emergency_supplies: 'First-aid box, safety pins, wireless mics, emergency generator, shawl baskets for chilly breeze.',
      schedule_delays: 'Planned 30-minute buffer for guest arrivals before formal dance performances commence.',
      budget_overruns: 'Strict ₹35,000 contingency reserve retained for extra food plates.'
    }
  };

  const sampleBudgetItems: BudgetItem[] = [
    { id: 'b-1', event_id: sampleEventId, category: 'Venue & Courtyard Rental', allocated_amount: 140000, actual_spent: 50000, notes: 'Heritage courtyard with lawn lighting and power generator', is_contingency: false },
    { id: 'b-2', event_id: sampleEventId, category: 'Royal Catering & Banquet', allocated_amount: 150000, actual_spent: 30000, notes: 'Full multi-course Rajasthani dinner + live chaat & dessert counters', is_contingency: false },
    { id: 'b-3', event_id: sampleEventId, category: 'Decor, Florals & Stage', allocated_amount: 70000, actual_spent: 20000, notes: 'Marigold draping, floral photo-arch, candlelit walkway', is_contingency: false },
    { id: 'b-4', event_id: sampleEventId, category: 'Photography & Cinematic Reel', allocated_amount: 45000, actual_spent: 15000, notes: '2 candid photographers + 1 drone videographer + 60-sec teaser', is_contingency: false },
    { id: 'b-5', event_id: sampleEventId, category: 'Sound, Stage, DJ & Dhol', allocated_amount: 35000, actual_spent: 10000, notes: 'High-end sound system, wireless mics, moving head lights, DJ & Dholak', is_contingency: false },
    { id: 'b-6', event_id: sampleEventId, category: 'Invitations & Digital Motion Cards', allocated_amount: 10000, actual_spent: 10000, notes: 'Bespoke digital watercolor invites + printed table menus', is_contingency: false },
    { id: 'b-7', event_id: sampleEventId, category: 'Guest Favors & Welcome Props', allocated_amount: 15000, actual_spent: 5000, notes: 'Handmade potlis, bangles, floral jewelry, and embroidered safas', is_contingency: false },
    { id: 'b-8', event_id: sampleEventId, category: 'Contingency Reserve', allocated_amount: 35000, actual_spent: 0, notes: 'Safety buffer for unexpected plate additions or overtime hours', is_contingency: true }
  ];

  const sampleTasks: TimelineTask[] = [
    { id: 't-1', event_id: sampleEventId, title: 'Book Lakeside Courtyard Venue', description: 'Inspect sound curfews, power generator, and rain backup hall', phase: 'Weeks Before', due_date: calculateDateOffset(sampleDate, -30), priority: 'High', is_completed: true, order_index: 0 },
    { id: 't-2', event_id: sampleEventId, title: 'Finalize Royal Banquet Tasting', description: 'Sample dal baati, laal maas, and live chaat recipes', phase: 'Weeks Before', due_date: calculateDateOffset(sampleDate, -23), priority: 'High', is_completed: true, order_index: 1 },
    { id: 't-3', event_id: sampleEventId, title: 'Choreography & Music Tracks', description: 'Conduct dance rehearsals with family members and send playlist to DJ', phase: 'Weeks Before', due_date: calculateDateOffset(sampleDate, -15), priority: 'Medium', is_completed: false, order_index: 2 },
    { id: 't-4', event_id: sampleEventId, title: 'Dispatch Motion Invites & Collect RSVPs', description: 'Confirm headcounts for catering and guest room reservations', phase: 'Final Week', due_date: calculateDateOffset(sampleDate, -7), priority: 'High', is_completed: false, order_index: 3 },
    { id: 't-5', event_id: sampleEventId, title: 'Stage & Lighting Sound Check', description: 'Test microphones, wireless lapels, and moving head lights', phase: 'Day Before', due_date: calculateDateOffset(sampleDate, -1), priority: 'Urgent', is_completed: false, order_index: 4 },
    { id: 't-6', event_id: sampleEventId, title: 'Welcome Guests & Sangeet Performance', description: 'Kick off evening with welcome thandai, folk welcome, and dances', phase: 'Event Day', due_date: sampleDate, priority: 'Urgent', is_completed: false, order_index: 5 },
    { id: 't-7', event_id: sampleEventId, title: 'Vendor Settlements & Thank You Cards', description: 'Clear final vendor invoices and send photo gallery link to guests', phase: 'Post-Event', due_date: calculateDateOffset(sampleDate, 2), priority: 'Low', is_completed: false, order_index: 6 }
  ];

  const sampleVendors: Vendor[] = [
    { id: 'v-1', event_id: sampleEventId, category: 'Venue', criteria: 'Heritage lake-view property, outdoor acoustic permission, valet parking', questions_to_ask: 'What is the deposit policy for rain backup?', estimated_cost: 140000, status: 'Booked', notes: 'Confirmed with manager Mr. Sharma', contact_info: '+91 98290 12345', deadline: calculateDateOffset(sampleDate, -30) },
    { id: 'v-2', event_id: sampleEventId, category: 'Catering', criteria: 'Authentic Rajasthani culinary team with live preparation stalls', questions_to_ask: 'Will you supply uniformed service staff and chinaware?', estimated_cost: 150000, status: 'Booked', notes: 'Tasting completed and menu signed', contact_info: '+91 98290 67890', deadline: calculateDateOffset(sampleDate, -25) },
    { id: 'v-3', event_id: sampleEventId, category: 'Decorations', criteria: 'Specialist in marigold installations, fairy lights, and brass props', questions_to_ask: 'How early will the stage backdrop be ready for sound check?', estimated_cost: 70000, status: 'Contacted', notes: 'Awaiting revised quotation for floral arch', contact_info: 'RoyalDecor Udaipur', deadline: calculateDateOffset(sampleDate, -20) },
    { id: 'v-4', event_id: sampleEventId, category: 'Photography', criteria: 'Storytelling candid photography + same-day reel editor', questions_to_ask: 'When will the teaser video and unedited photos be delivered?', estimated_cost: 45000, status: 'Contacted', notes: 'Shortlisted 2 photographers', contact_info: 'contact@candidmoments.in', deadline: calculateDateOffset(sampleDate, -17) },
    { id: 'v-5', event_id: sampleEventId, category: 'Entertainment', criteria: 'Renowned DJ with high-energy Bollywood/Sangeet mixes + dhol players', questions_to_ask: 'Do you carry backup mixers and laptop systems?', estimated_cost: 35000, status: 'Not Started', notes: 'Interviewing 2 local DJs', contact_info: 'DJ Rajat (+91 98290 99887)', deadline: calculateDateOffset(sampleDate, -13) }
  ];

  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([sampleEvent]));
  localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(sampleBudgetItems));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sampleTasks));
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(sampleVendors));
}

export const StorageService = {
  init() {
    initSampleData();
  },

  getAllEvents(): (CelebrationEvent & { total_tasks: number; completed_tasks: number; total_allocated: number })[] {
    initSampleData();
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const budgetItems: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');

    return events.map(event => {
      const eventTasks = tasks.filter(t => t.event_id === event.id);
      const total_tasks = eventTasks.length;
      const completed_tasks = eventTasks.filter(t => t.is_completed).length;
      const eventBudgets = budgetItems.filter(b => b.event_id === event.id);
      const total_allocated = eventBudgets.reduce((acc, curr) => acc + (curr.allocated_amount || 0), 0);

      return {
        ...event,
        total_tasks,
        completed_tasks,
        total_allocated
      };
    }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  },

  getEventById(id: string): CelebrationEvent | null {
    initSampleData();
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    return events.find(e => e.id === id) || null;
  },

  saveGeneratedPlan(
    eventPayload: Partial<CelebrationEvent>,
    planResult: GeneratedPlanResult
  ): string {
    initSampleData();
    const newId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newEvent: CelebrationEvent = {
      id: newId,
      name: eventPayload.name || 'My Celebration',
      event_type: eventPayload.event_type || 'Other',
      event_date: eventPayload.event_date || getSampleDate(30),
      location: eventPayload.location || 'Venue',
      guests: Number(eventPayload.guests) || 50,
      total_budget: Number(eventPayload.total_budget) || 100000,
      theme: eventPayload.theme || planResult.overview?.theme || 'Classic Elegance',
      venue_preference: eventPayload.venue_preference || 'Flexible',
      food_preference: eventPayload.food_preference || 'Mixed',
      duration: eventPayload.duration || '4-5 hours',
      special_requirements: eventPayload.special_requirements || '',
      planning_style: eventPayload.planning_style || 'Balanced',
      status: 'Planning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      overview: planResult.overview,
      creative: planResult.creative_recommendations,
      risk: planResult.risk_management
    };

    // Save event
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    // Save budget items
    const allBudgets: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');
    const newBudgets: BudgetItem[] = (planResult.budget_breakdown || []).map((b, idx) => ({
      id: `b-${newId}-${idx}`,
      event_id: newId,
      category: b.category,
      allocated_amount: b.allocated_amount,
      actual_spent: 0,
      notes: b.notes || '',
      is_contingency: !!b.is_contingency || b.category.toLowerCase().includes('contingency')
    }));
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify([...allBudgets, ...newBudgets]));

    // Save timeline tasks
    const allTasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const newTasks: TimelineTask[] = (planResult.preparation_timeline || []).map((t, idx) => ({
      id: `t-${newId}-${idx}`,
      event_id: newId,
      title: t.title,
      description: t.description || '',
      phase: t.phase || 'Weeks Before',
      due_date: t.due_date || (t.offset_days !== undefined ? calculateDateOffset(newEvent.event_date, t.offset_days) : newEvent.event_date),
      priority: t.priority || 'Medium',
      is_completed: false,
      order_index: idx
    }));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([...allTasks, ...newTasks]));

    // Save vendors
    const allVendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    const newVendors: Vendor[] = (planResult.vendor_checklist || []).map((v, idx) => ({
      id: `v-${newId}-${idx}`,
      event_id: newId,
      category: v.category,
      criteria: v.criteria || '',
      questions_to_ask: v.questions_to_ask || '',
      estimated_cost: v.estimated_cost || 0,
      status: 'Not Started',
      notes: '',
      contact_info: '',
      deadline: v.deadline || (v.deadline_offset_days !== undefined ? calculateDateOffset(newEvent.event_date, v.deadline_offset_days) : '')
    }));
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify([...allVendors, ...newVendors]));

    return newId;
  },

  saveNewEventWithPlan(
    eventPayload: Partial<CelebrationEvent>,
    planResult: GeneratedPlanResult
  ): string {
    return this.saveGeneratedPlan(eventPayload, planResult);
  },

  updateEvent(id: string, updates: Partial<CelebrationEvent>): boolean {
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return false;

    events[idx] = {
      ...events[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return true;
  },

  deleteEvent(id: string): boolean {
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const filteredEvents = events.filter(e => e.id !== id);
    if (filteredEvents.length === events.length) return false;

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredEvents));

    // Cascade delete child entities
    const budgets: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(budgets.filter(b => b.event_id !== id)));

    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks.filter(t => t.event_id !== id)));

    const vendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors.filter(v => v.event_id !== id)));

    return true;
  },

  duplicateEvent(id: string): string | null {
    const orig = this.getEventById(id);
    if (!orig) return null;

    const newId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const clonedEvent: CelebrationEvent = {
      ...orig,
      id: newId,
      name: `Copy of ${orig.name}`,
      status: 'Planning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    events.unshift(clonedEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    // Duplicate budget items
    const origBudgets = this.getBudgetItems(id);
    const newBudgets: BudgetItem[] = origBudgets.map((b, idx) => ({
      ...b,
      id: `b-${newId}-${idx}`,
      event_id: newId,
      actual_spent: 0
    }));
    const allBudgets: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify([...allBudgets, ...newBudgets]));

    // Duplicate tasks
    const origTasks = this.getTimelineTasks(id);
    const newTasks: TimelineTask[] = origTasks.map((t, idx) => ({
      ...t,
      id: `t-${newId}-${idx}`,
      event_id: newId,
      is_completed: false
    }));
    const allTasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([...allTasks, ...newTasks]));

    // Duplicate vendors
    const origVendors = this.getVendors(id);
    const newVendors: Vendor[] = origVendors.map((v, idx) => ({
      ...v,
      id: `v-${newId}-${idx}`,
      event_id: newId,
      status: 'Not Started'
    }));
    const allVendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify([...allVendors, ...newVendors]));

    return newId;
  },

  // Budget Items
  getBudgetItems(eventId: string): BudgetItem[] {
    initSampleData();
    const items: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');
    return items.filter(b => b.event_id === eventId);
  },

  updateBudgetItems(eventId: string, items: BudgetItem[]): boolean {
    const allItems: BudgetItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]');
    const remaining = allItems.filter(b => b.event_id !== eventId);
    const updated = items.map((item, idx) => ({
      ...item,
      id: item.id || `b-${eventId}-${idx}-${Date.now()}`,
      event_id: eventId,
      allocated_amount: Number(item.allocated_amount) || 0,
      actual_spent: Number(item.actual_spent) || 0,
      is_contingency: !!item.is_contingency || item.category.toLowerCase().includes('contingency')
    }));
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify([...remaining, ...updated]));
    return true;
  },

  calculateBudgetSummary(totalBudget: number, items: BudgetItem[]): BudgetSummary {
    let totalPlanned = 0;
    let contingency = 0;

    const categoryBreakdown = items.map(item => {
      const allocated = Number(item.allocated_amount) || 0;
      const spent = Number(item.actual_spent) || 0;
      const isContingency = Boolean(item.is_contingency) || item.category.toLowerCase().includes('contingency');

      if (isContingency) {
        contingency += allocated;
      } else {
        totalPlanned += allocated;
      }

      return {
        ...item,
        allocated_amount: allocated,
        actual_spent: spent,
        is_contingency: isContingency,
        allocated_formatted: formatINR(allocated),
        actual_formatted: formatINR(spent),
        percentage: totalBudget > 0 ? Math.round((allocated / totalBudget) * 1000) / 10 : 0
      };
    });

    const totalAllocated = totalPlanned + contingency;
    const remainingBudget = totalBudget - totalAllocated;
    const isOverBudget = remainingBudget < 0;

    return {
      total_budget: totalBudget,
      total_budget_formatted: formatINR(totalBudget),
      total_planned: totalPlanned,
      total_planned_formatted: formatINR(totalPlanned),
      contingency: contingency,
      contingency_formatted: formatINR(contingency),
      total_allocated: totalAllocated,
      total_allocated_formatted: formatINR(totalAllocated),
      remaining_budget: remainingBudget,
      remaining_budget_formatted: formatINR(remainingBudget),
      is_over_budget: isOverBudget,
      overage_amount: isOverBudget ? Math.abs(remainingBudget) : 0,
      overage_formatted: isOverBudget ? formatINR(Math.abs(remainingBudget)) : '₹0',
      utilization_percentage: totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 1000) / 10 : 0,
      items: categoryBreakdown
    };
  },

  // Timeline Tasks
  getTimelineTasks(eventId: string): TimelineTask[] {
    initSampleData();
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const phaseOrder: Record<string, number> = {
      'Weeks Before': 1,
      'Final Week': 2,
      'Day Before': 3,
      'Event Day': 4,
      'Post-Event': 5
    };

    return tasks
      .filter(t => t.event_id === eventId)
      .sort((a, b) => {
        const orderA = phaseOrder[a.phase] || 6;
        const orderB = phaseOrder[b.phase] || 6;
        if (orderA !== orderB) return orderA - orderB;
        return (a.due_date || '').localeCompare(b.due_date || '');
      });
  },

  addTimelineTask(eventId: string, task: Omit<TimelineTask, 'id' | 'event_id' | 'is_completed'> & { is_completed?: boolean }): string {
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const newId = `t-${eventId}-${Date.now()}`;
    const newTask: TimelineTask = {
      ...task,
      id: newId,
      event_id: eventId,
      is_completed: !!task.is_completed
    };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newId;
  },

  updateTimelineTask(taskId: string, updates: Partial<TimelineTask>): boolean {
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return false;

    tasks[idx] = { ...tasks[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  },

  deleteTimelineTask(taskId: string): boolean {
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const filtered = tasks.filter(t => t.id !== taskId);
    if (filtered.length === tasks.length) return false;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
    return true;
  },

  // Vendors
  getVendors(eventId: string): Vendor[] {
    initSampleData();
    const vendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    return vendors.filter(v => v.event_id === eventId);
  },

  addVendor(eventId: string, vendor: Omit<Vendor, 'id' | 'event_id'>): string {
    const vendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    const newId = `v-${eventId}-${Date.now()}`;
    const newVendor: Vendor = {
      ...vendor,
      id: newId,
      event_id: eventId
    };
    vendors.push(newVendor);
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
    return newId;
  },

  updateVendor(vendorId: string, updates: Partial<Vendor>): boolean {
    const vendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    const idx = vendors.findIndex(v => v.id === vendorId);
    if (idx === -1) return false;

    vendors[idx] = { ...vendors[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
    return true;
  },

  deleteVendor(vendorId: string): boolean {
    const vendors: Vendor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
    const filtered = vendors.filter(v => v.id !== vendorId);
    if (filtered.length === vendors.length) return false;
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(filtered));
    return true;
  },

  // Dashboard Metrics
  getDashboardMetrics(): DashboardMetrics {
    initSampleData();
    const events: CelebrationEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const tasks: TimelineTask[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = events.filter(e => e.event_date >= todayStr).length;
    const totalBudgetSum = events.reduce((sum, e) => sum + (Number(e.total_budget) || 0), 0);
    const completedTasks = tasks.filter(t => t.is_completed).length;

    return {
      total_events: events.length,
      upcoming_events: upcoming,
      total_budget_sum: totalBudgetSum,
      completed_tasks: completedTasks,
      total_tasks: tasks.length
    };
  }
};

export const storageService = StorageService;
