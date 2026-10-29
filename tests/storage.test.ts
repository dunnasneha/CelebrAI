import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storageService';
import { CreateEventFormData, GeneratedPlanResult } from '../src/types';

// Mock localStorage for Node test runner
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value.toString(); },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Storage Persistence & Event Lifecycle Management', () => {
  beforeEach(() => {
    localStorage.clear();
    StorageService.init();
  });

  it('initializes default seeded sample celebration when empty', () => {
    const events = StorageService.getAllEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].name).toContain('Royal Sangeet');
  });

  it('creates, retrieves, and cascades deletions for new events', () => {
    const form: CreateEventFormData = {
      name: 'Tech Horizon Fest 2026',
      event_type: 'College Event',
      event_date: '2026-12-05',
      location: 'Hyderabad, Telangana',
      guests: 500,
      total_budget: 300000,
      venue_preference: 'Auditorium',
      food_preference: 'Vegetarian',
      duration: '8 hours',
      special_requirements: 'Robotics arena and keynote stage',
      planning_style: 'Balanced'
    };

    const mockPlan: GeneratedPlanResult = {
      overview: {
        concept: 'Flagship engineering gala and tech exhibitions',
        theme: 'Future & Circuit Glow',
        atmosphere: 'High-tech and energetic',
        target_audience: 'College students and mentors',
        personalized_description: 'An exciting annual campus showcase',
        key_considerations: ['Power backup', 'Stage audio']
      },
      budget_breakdown: [
        { category: 'Keynote Stage', percentage: 40, allocated_amount: 120000, notes: 'LED wall and sound' },
        { category: 'Catering Box', percentage: 45, allocated_amount: 135000, notes: 'Student lunch packs' },
        { category: 'Emergency Reserve', percentage: 15, allocated_amount: 45000, is_contingency: true, notes: 'Contingency' }
      ],
      preparation_timeline: [
        { phase: 'Weeks Before', title: 'Book Keynote Speakers', description: 'Confirm industry guests', offset_days: -30, priority: 'Urgent' },
        { phase: 'Event Day', title: 'Campus Hackathon Kickoff', description: 'Opening ceremony', offset_days: 0, priority: 'High' }
      ],
      vendor_checklist: [
        { category: 'Audio-Visual', criteria: 'Pro sound & lights', questions_to_ask: 'Do you provide on-site sound engineers?', estimated_cost: 60000, deadline_offset_days: -15 }
      ]
    };

    const eventId = StorageService.saveNewEventWithPlan(form, mockPlan);
    expect(eventId).toBeTruthy();

    const fetched = StorageService.getEventById(eventId);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Tech Horizon Fest 2026');

    const budgets = StorageService.getBudgetItems(eventId);
    expect(budgets.length).toBe(3);

    const tasks = StorageService.getTimelineTasks(eventId);
    expect(tasks.length).toBe(2);

    const vendors = StorageService.getVendors(eventId);
    expect(vendors.length).toBe(1);

    // Delete event and verify cascade
    const deleted = StorageService.deleteEvent(eventId);
    expect(deleted).toBe(true);
    expect(StorageService.getEventById(eventId)).toBeNull();
    expect(StorageService.getBudgetItems(eventId).length).toBe(0);
    expect(StorageService.getTimelineTasks(eventId).length).toBe(0);
    expect(StorageService.getVendors(eventId).length).toBe(0);
  });

  it('duplicates existing events cleanly with new unique IDs', () => {
    const events = StorageService.getAllEvents();
    const origId = events[0].id;
    const clonedId = StorageService.duplicateEvent(origId);

    expect(clonedId).toBeTruthy();
    expect(clonedId).not.toBe(origId);

    const cloned = StorageService.getEventById(clonedId!);
    expect(cloned?.name).toContain('Copy of');
  });

  it('aggregates dashboard overview metrics dynamically', () => {
    const metrics = StorageService.getDashboardMetrics();
    expect(metrics.total_events).toBeGreaterThan(0);
    expect(metrics.total_budget_sum).toBeGreaterThan(0);
    expect(metrics.total_tasks).toBeGreaterThan(0);
  });
});
