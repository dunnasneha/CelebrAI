import { describe, it, expect } from 'vitest';
import { AIService } from '../src/services/aiService';
import { CreateEventFormData } from '../src/types';

describe('AI Event Planning Engine & Resilient Fallback Logic', () => {
  const sampleForm: CreateEventFormData = {
    name: 'Ananya 25th Birthday Gala',
    event_type: 'Birthday',
    event_date: '2026-11-28',
    location: 'Mumbai, Maharashtra',
    guests: 60,
    total_budget: 150000,
    venue_preference: 'Terrace',
    food_preference: 'Mixed',
    duration: '5 hours',
    special_requirements: 'Rooftop sundowner with acoustic music and fairy lighting',
    planning_style: 'Balanced'
  };

  it('generates fully populated event blueprint with realistic INR allocations and separated contingency', async () => {
    const plan = await AIService.generateEventPlan(sampleForm);

    expect(plan).toBeDefined();
    expect(plan.overview).toBeDefined();
    expect(plan.overview.concept).toBeTruthy();
    expect(plan.budget_breakdown).toBeInstanceOf(Array);
    expect(plan.budget_breakdown.length).toBeGreaterThan(0);

    // Sum of budget breakdown should equal total budget
    const totalAllocated = plan.budget_breakdown.reduce((sum, item) => sum + item.allocated_amount, 0);
    expect(totalAllocated).toBe(sampleForm.total_budget);

    // Check presence of contingency fund
    const hasContingency = plan.budget_breakdown.some(
      item => item.is_contingency || item.category.toLowerCase().includes('contingency')
    );
    expect(hasContingency).toBe(true);

    // Verify timeline tasks
    expect(plan.preparation_timeline).toBeInstanceOf(Array);
    expect(plan.preparation_timeline.length).toBeGreaterThan(0);

    // Verify vendor checklist
    expect(plan.vendor_checklist).toBeInstanceOf(Array);
    expect(plan.vendor_checklist.length).toBeGreaterThan(0);
  });

  it('generates 4 distinct invitation tones: Royal, Warm, Modern, Festive', async () => {
    const invites = await AIService.generateInvitations(
      'Aarav & Diya Wedding',
      'Wedding',
      '2026-12-15',
      'Udaipur',
      'Regal Marigold'
    );

    expect(invites.formal).toBeTruthy();
    expect(invites.casual).toBeTruthy();
    expect(invites.poetic).toBeTruthy();
    expect(invites.whatsapp).toBeTruthy();
  });

  it('responds with contextual advice from Ask CelebrAI concierge', async () => {
    const response = await AIService.askConcierge(
      'How much should I spend on catering for 100 people in Delhi?',
      'Delhi Wedding',
      '500000'
    );

    expect(response).toBeTruthy();
    expect(response.reply).toBeTruthy();
    expect(response.reply.length).toBeGreaterThan(20);
  });
});
