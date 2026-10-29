/**
 * Formats a number into Indian Rupee representation (e.g. 150000 -> ₹1,50,000, 1250000 -> ₹12,50,000).
 * Adheres strictly to the Indian numbering system (crores, lakhs, thousands).
 */
export function formatINR(number: number | string | undefined | null): string {
  if (number === undefined || number === null || number === '') {
    return '₹0';
  }
  const val = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(val)) {
    return '₹0';
  }

  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const s = absVal.toString();

  if (s.length <= 3) {
    return `${isNegative ? '-₹' : '₹'}${s}`;
  }

  const lastThree = s.slice(-3);
  let remaining = s.slice(0, -3);
  const parts: string[] = [];

  while (remaining.length > 2) {
    parts.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }

  if (remaining.length > 0) {
    parts.unshift(remaining);
  }

  const formatted = parts.join(',') + ',' + lastThree;
  return `${isNegative ? '-₹' : '₹'}${formatted}`;
}

/**
 * Calculates due date string given a base event date string (YYYY-MM-DD) and an offset in days.
 */
export function calculateDateOffset(eventDateStr: string, offsetDays: number): string {
  try {
    const base = new Date(eventDateStr);
    if (isNaN(base.getTime())) {
      return eventDateStr;
    }
    const target = new Date(base.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return target.toISOString().split('T')[0];
  } catch {
    return eventDateStr;
  }
}

/**
 * Formats a YYYY-MM-DD date into a friendly readable date (e.g. Nov 14, 2026).
 */
export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates days remaining from today until event date.
 */
export function getDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}
