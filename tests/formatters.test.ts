import { describe, it, expect } from 'vitest';
import { formatINR, calculateDateOffset, getDaysRemaining, formatReadableDate } from '../src/utils/formatters';

describe('Indian Rupee (INR) Formatter Engine', () => {
  it('formats figures under thousands properly', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(500)).toBe('₹500');
    expect(formatINR(999)).toBe('₹999');
  });

  it('formats figures in Thousands, Lakhs, and Crores per Indian Numbering Standards', () => {
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(10000)).toBe('₹10,000');
    expect(formatINR(100000)).toBe('₹1,00,000');
    expect(formatINR(500000)).toBe('₹5,00,000');
    expect(formatINR(2500000)).toBe('₹25,00,000');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
    expect(formatINR(55000000)).toBe('₹5,50,00,000');
  });

  it('handles string numerical input and invalid edge cases gracefully', () => {
    expect(formatINR('250000')).toBe('₹2,50,000');
    expect(formatINR('')).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
    expect(formatINR(null as unknown as number)).toBe('₹0');
    expect(formatINR(undefined as unknown as number)).toBe('₹0');
  });
});

describe('Date Utilities & Timeline Offsets', () => {
  it('correctly shifts base event date forward and backward', () => {
    const baseDate = '2026-11-15';
    // 30 days before
    expect(calculateDateOffset(baseDate, -30)).toBe('2026-10-16');
    // 1 day before
    expect(calculateDateOffset(baseDate, -1)).toBe('2026-11-14');
    // 0 days
    expect(calculateDateOffset(baseDate, 0)).toBe('2026-11-15');
    // 3 days post event
    expect(calculateDateOffset(baseDate, 3)).toBe('2026-11-18');
  });

  it('formats readable human dates correctly', () => {
    const readable = formatReadableDate('2026-12-25');
    expect(readable).toContain('Dec');
    expect(readable).toContain('25');
    expect(readable).toContain('2026');
  });

  it('returns valid days remaining relative to today', () => {
    const futureDate = '2099-01-01';
    expect(getDaysRemaining(futureDate)).toBeGreaterThan(1000);
    const pastDate = '2020-01-01';
    expect(getDaysRemaining(pastDate)).toBe(0);
  });
});
