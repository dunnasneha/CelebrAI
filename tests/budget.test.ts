import { describe, it, expect } from 'vitest';
import { StorageService } from '../src/services/storageService';
import { CelebrationEvent, BudgetItem } from '../src/types';

describe('Financial Budget Engine & Contingency Reserve Isolation', () => {
  const sampleEvent: CelebrationEvent = {
    id: 'evt-budget-test',
    name: 'Priya & Rohan Sangeet',
    event_type: 'Wedding',
    event_date: '2026-12-10',
    location: 'Jaipur, Rajasthan',
    guests: 150,
    total_budget: 600000,
    theme: 'Royal Rajputana',
    venue_preference: 'Outdoor',
    food_preference: 'Mixed',
    planning_style: 'Balanced',
    created_at: new Date().toISOString()
  };

  const sampleItems: BudgetItem[] = [
    { id: 'b-1', event_id: sampleEvent.id, category: 'Venue', allocated_amount: 180000, actual_spent: 175000, is_contingency: false },
    { id: 'b-2', event_id: sampleEvent.id, category: 'Catering', allocated_amount: 220000, actual_spent: 220000, is_contingency: false },
    { id: 'b-3', event_id: sampleEvent.id, category: 'Decor', allocated_amount: 80000, actual_spent: 75000, is_contingency: false },
    { id: 'b-4', event_id: sampleEvent.id, category: 'Contingency Fund', allocated_amount: 60000, actual_spent: 0, is_contingency: true }
  ];

  it('accurately segregates regular expense items from emergency contingency reserve', () => {
    const summary = StorageService.calculateBudgetSummary(sampleEvent.total_budget, sampleItems);
    
    // Regular planned total = 180k + 220k + 80k = 480,000
    expect(summary.total_planned).toBe(480000);
    // Contingency reserve = 60,000
    expect(summary.contingency).toBe(60000);
    // Total allocated = planned (480k) + contingency (60k) = 540,000
    expect(summary.total_allocated).toBe(540000);
    // Remaining = 600,000 - 540,000 = 60,000
    expect(summary.remaining_budget).toBe(60000);
    expect(summary.is_over_budget).toBe(false);
  });

  it('calculates correct utilization percentage and flags budget overruns', () => {
    const overageItems: BudgetItem[] = [
      ...sampleItems,
      { id: 'b-5', event_id: sampleEvent.id, category: 'Luxury Cars', allocated_amount: 100000, actual_spent: 0, is_contingency: false }
    ];

    const summary = StorageService.calculateBudgetSummary(sampleEvent.total_budget, overageItems);
    // Total allocated = 540k + 100k = 640,000 (exceeds 600k budget)
    expect(summary.total_allocated).toBe(640000);
    expect(summary.remaining_budget).toBe(-40000);
    expect(summary.is_over_budget).toBe(true);
    expect(summary.overage_amount).toBe(40000);
    expect(summary.utilization_percentage).toBe(106.7);
  });

  it('computes exact category allocation percentages relative to total budget', () => {
    const summary = StorageService.calculateBudgetSummary(sampleEvent.total_budget, sampleItems);
    const venueItem = summary.items.find(i => i.category === 'Venue');
    const cateringItem = summary.items.find(i => i.category === 'Catering');
    
    // Venue: 180,000 / 600,000 = 30%
    expect(venueItem?.percentage).toBe(30);
    // Catering: 220,000 / 600,000 = 36.7%
    expect(cateringItem?.percentage).toBe(36.7);
  });
});
