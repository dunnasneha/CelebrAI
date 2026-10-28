"""
Budget Calculation and Optimization Service for CelebrAI.
Handles authoritative calculations, Indian Rupee (INR) formatting,
and budget distribution rules.
"""

def format_inr(number):
    """
    Format number as Indian Rupee (e.g. 150000 -> ₹1,50,000, 1250000 -> ₹12,50,000)
    Follows Indian numbering system (crores, lakhs, thousands).
    """
    try:
        val = float(number)
    except (ValueError, TypeError):
        return "₹0"

    is_negative = val < 0
    val = abs(val)
    val_int = int(round(val))

    s = str(val_int)
    if len(s) <= 3:
        formatted = s
    else:
        # Last 3 digits
        last_three = s[-3:]
        remaining = s[:-3]
        # Group in 2s from the right
        parts = []
        while len(remaining) > 2:
            parts.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            parts.insert(0, remaining)
        formatted = ",".join(parts) + "," + last_three

    prefix = "-₹" if is_negative else "₹"
    return f"{prefix}{formatted}"


def calculate_budget_summary(total_budget, items):
    """
    Calculates authoritative totals for budget items.
    Prevents double counting contingency reserve.
    Formula:
      Total Planned = Sum(allocated_amount for non-contingency items)
      Contingency = Sum(allocated_amount for contingency items)
      Total Allocated = Total Planned + Contingency
      Remaining Budget = Total Budget - Total Allocated
    """
    try:
        total_budget = float(total_budget)
    except (ValueError, TypeError):
        total_budget = 0.0

    total_planned = 0.0
    contingency = 0.0
    category_breakdown = []

    for item in items:
        try:
            allocated = float(item.get('allocated_amount', 0))
        except (ValueError, TypeError):
            allocated = 0.0

        if allocated < 0:
            allocated = 0.0

        is_contingency = bool(item.get('is_contingency', False)) or (item.get('category', '').lower() == 'contingency reserve')

        if is_contingency:
            contingency += allocated
        else:
            total_planned += allocated

        category_breakdown.append({
            'id': item.get('id'),
            'category': item.get('category', 'Miscellaneous'),
            'allocated_amount': allocated,
            'allocated_formatted': format_inr(allocated),
            'actual_spent': float(item.get('actual_spent', 0)),
            'actual_formatted': format_inr(float(item.get('actual_spent', 0))),
            'notes': item.get('notes', ''),
            'is_contingency': is_contingency,
            'percentage': round((allocated / total_budget * 100), 1) if total_budget > 0 else 0
        })

    total_allocated = total_planned + contingency
    remaining_budget = total_budget - total_allocated
    is_over_budget = remaining_budget < 0
    utilization_pct = round((total_allocated / total_budget * 100), 1) if total_budget > 0 else 0

    return {
        'total_budget': total_budget,
        'total_budget_formatted': format_inr(total_budget),
        'total_planned': total_planned,
        'total_planned_formatted': format_inr(total_planned),
        'contingency': contingency,
        'contingency_formatted': format_inr(contingency),
        'total_allocated': total_allocated,
        'total_allocated_formatted': format_inr(total_allocated),
        'remaining_budget': remaining_budget,
        'remaining_budget_formatted': format_inr(remaining_budget),
        'is_over_budget': is_over_budget,
        'overage_amount': abs(remaining_budget) if is_over_budget else 0,
        'overage_formatted': format_inr(abs(remaining_budget)) if is_over_budget else "₹0",
        'utilization_percentage': utilization_pct,
        'items': category_breakdown,
        'categories': category_breakdown,
        'budget_items': category_breakdown
    }


def get_default_budget_breakdown(total_budget, event_type="Other", planning_style="Balanced"):
    """
    Returns realistic baseline allocations in INR for typical event categories
    customized by event type and planning style.
    """
    try:
        total_budget = float(total_budget)
    except (ValueError, TypeError):
        total_budget = 100000.0

    # Baseline distribution percentages
    if event_type.lower() == 'wedding':
        ratios = {
            'Venue': 0.30,
            'Catering': 0.28,
            'Decorations': 0.12,
            'Photography & Videography': 0.10,
            'Entertainment': 0.05,
            'Invitations & Favors': 0.03,
            'Transportation': 0.03,
            'Miscellaneous': 0.03,
            'Contingency Reserve': 0.06
        }
    elif event_type.lower() == 'birthday':
        ratios = {
            'Venue': 0.25,
            'Catering': 0.35,
            'Decorations': 0.15,
            'Photography': 0.08,
            'Entertainment & Games': 0.07,
            'Invitations': 0.02,
            'Miscellaneous': 0.03,
            'Contingency Reserve': 0.05
        }
    elif event_type.lower() == 'college event':
        ratios = {
            'Venue & Logistics': 0.20,
            'Sound, Lights & Stage': 0.25,
            'Guest Speakers / Performers': 0.20,
            'Food & Refreshments': 0.15,
            'Promotion & Print': 0.05,
            'Prizes & Mementos': 0.05,
            'Contingency Reserve': 0.10
        }
    else:
        ratios = {
            'Venue': 0.28,
            'Catering': 0.30,
            'Decorations': 0.14,
            'Photography': 0.08,
            'Entertainment': 0.07,
            'Invitations': 0.02,
            'Miscellaneous': 0.04,
            'Contingency Reserve': 0.07
        }

    # Adjust slightly for planning style
    if planning_style.lower() == 'budget-friendly':
        # Increase contingency slightly, lower decor/entertainment
        pass
    elif planning_style.lower() == 'premium':
        # More towards decor & photography
        pass

    items = []
    allocated_sum = 0
    cat_list = list(ratios.items())

    for i, (cat, ratio) in enumerate(cat_list):
        if i == len(cat_list) - 1:
            amount = max(0, total_budget - allocated_sum)
        else:
            amount = round(total_budget * ratio)
            allocated_sum += amount

        is_cont = 'contingency' in cat.lower()
        items.append({
            'category': cat,
            'allocated_amount': amount,
            'actual_spent': 0,
            'notes': f"Estimated baseline allocation ({int(ratio*100)}% of budget)",
            'is_contingency': 1 if is_cont else 0
        })

    return items
