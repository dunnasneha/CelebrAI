import { describe, it, expect } from 'vitest';
import { formatINR, calculateDateOffset } from '../utils/formatters';
import { storageService } from './storageService';
import { CelebrationEvent, BudgetItem } from '../types';

describe('Financial Budget Engine & Contingency Isolation', () => {
  const mockEvent: CelebrationEvent = {
    id: 'test-event-1',
    name: 'Diya & Aarav Celebration',
    event_type: 'Wedding',
    event_date: '2026-11-20',
    location: 'Jaipur, Rajasthan',
    guests: 200,
    total_budget: 500000,
    venue_preference: 'Palace Banquet',
    food_preference: 'Traditional Vegetarian',
    theme: 'Royal Rajputana',
    planning_style: 'Balanced',
    created_at: new Date().toISOString()
  };

  const mockBudgetItems: BudgetItem[] = [
    {
      id: 'b1',
      event_id: 'test-event-1',
      category: 'Venue & Staging',
      allocated_amount: 150000,
      actual_spent: 145000,
      is_contingency: false,
      notes: 'Main courtyard'
    },
    {
      id: 'b2',
      event_id: 'test-event-1',
      category: 'Royal Catering',
      allocated_amount: 180000,
      actual_spent: 180000,
      is_contingency: false,
      notes: 'Buffet + live counters'
    },
    {
      id: 'b3',
      event_id: 'test-event-1',
      category: 'Contingency Fund',
      allocated_amount: 50000,
      actual_spent: 0,
      is_contingency: true,
      notes: '10% safety reserve'
    }
  ];

  it('correctly calculates planned total and isolates contingency without double counting', () => {
    const summary = storageService.calculateBudgetSummary(mockEvent.total_budget, mockBudgetItems);
    // Total planned (excluding contingency) = 150,000 + 180,000 = 330,000
    expect(summary.total_planned).toBe(330000);
    // Contingency amount = 50,000
    expect(summary.contingency).toBe(50000);
    // Total allocated = planned (330,000) + contingency (50,000) = 380,000
    expect(summary.total_allocated).toBe(380000);
    // Remaining budget = 500,000 - 380,000 = 120,000
    expect(summary.remaining_budget).toBe(120000);
    expect(summary.is_over_budget).toBe(false);
  });

  it('detects over-budget conditions accurately', () => {
    const overAllocatedItems: BudgetItem[] = [
      ...mockBudgetItems,
      {
        id: 'b4',
        event_id: 'test-event-1',
        category: 'Luxury Transportation',
        allocated_amount: 150000,
        actual_spent: 0,
        is_contingency: false
      }
    ];

    // Total allocated: 330k + 50k + 150k = 530k > 500k
    const summary = storageService.calculateBudgetSummary(mockEvent.total_budget, overAllocatedItems);
    expect(summary.remaining_budget).toBe(-30000);
    expect(summary.is_over_budget).toBe(true);
    expect(summary.overage_amount).toBe(30000);
  });
});

describe('Indian Rupee (INR) Formatter & Numbering System', () => {
  it('formats amounts in Indian Lakhs and Crores standard correctly', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(5000)).toBe('₹5,000');
    expect(formatINR(50000)).toBe('₹50,000');
    expect(formatINR(500000)).toBe('₹5,00,000');
    expect(formatINR(2500000)).toBe('₹25,00,000');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
  });

  it('handles string numbers and edge values gracefully', () => {
    expect(formatINR('150000')).toBe('₹1,50,000');
    expect(formatINR(undefined as any)).toBe('₹0');
    expect(formatINR(null as any)).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
  });
});

describe('Date Offset & Timeline Calculations', () => {
  it('computes offset target dates correctly', () => {
    const baseDate = '2026-12-25';
    // 10 days before
    expect(calculateDateOffset(baseDate, -10)).toBe('2026-12-15');
    // 5 days after
    expect(calculateDateOffset(baseDate, 5)).toBe('2026-12-30');
    // Same day
    expect(calculateDateOffset(baseDate, 0)).toBe('2026-12-25');
  });
});

describe('Budget Item Percentage & Calculations', () => {
  it('calculates percentage accurately across items', () => {
    const items: BudgetItem[] = [
      { id: '1', event_id: 'e1', category: 'Decor', allocated_amount: 50000, actual_spent: 40000 },
      { id: '2', event_id: 'e1', category: 'Food', allocated_amount: 50000, actual_spent: 50000 }
    ];
    const summary = storageService.calculateBudgetSummary(100000, items);
    expect(summary.total_allocated).toBe(100000);
    expect(summary.utilization_percentage).toBe(100);
    expect(summary.items[0].percentage).toBe(50);
    expect(summary.items[1].percentage).toBe(50);
  });
});

